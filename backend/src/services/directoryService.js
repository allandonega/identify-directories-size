// backend/src/services/directoryService.js
const fs = require('fs')
const fsPromises = fs.promises // CRÍTICO #4: Usar promises para não-bloqueante
const path = require('path')

/**
 * Calcula o tamanho total de um diretório em bytes
 * @param {string} dirPath - Caminho do diretório
 * @returns {number} Tamanho total em bytes
 * @throws {Error} Se o diretório não existe ou não tem permissão
 */
const calculateDirectorySize = (dirPath) => {
  if (!dirPath || typeof dirPath !== 'string') {
    throw new Error('Caminho inválido')
  }

  if (!fs.existsSync(dirPath)) {
    throw new Error(`Diretório não existe: ${dirPath}`)
  }

  const stats = fs.statSync(dirPath)
  if (!stats.isDirectory()) {
    throw new Error(`Caminho não é um diretório: ${dirPath}`)
  }

  let totalSize = 0

  try {
    const files = fs.readdirSync(dirPath)

    files.forEach((file) => {
      const filePath = path.join(dirPath, file)

      try {
        const fileStats = fs.statSync(filePath)

        if (fileStats.isDirectory()) {
          totalSize += calculateDirectorySize(filePath)
        } else {
          totalSize += fileStats.size
        }
      } catch (err) {
        // Ignorar arquivos/pastas com problemas de permissão
        console.warn(`Erro ao acessar: ${filePath}`, err.message)
      }
    })
  } catch (err) {
    throw new Error(`Erro ao ler diretório: ${err.message}`)
  }

  return totalSize
}

/**
 * Formata bytes em unidade legível (B, KB, MB, GB)
 * @param {number} bytes - Tamanho em bytes
 * @returns {string} Tamanho formatado
 * @throws {Error} Se input não é um número
 */
const formatBytes = (bytes) => {
  if (typeof bytes !== 'number' || bytes === null || isNaN(bytes)) {
    throw new Error('Entrada deve ser um número')
  }

  if (bytes === 0) return '0 B'

  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  // Para bytes, não usar decimal
  if (i === 0) {
    return bytes + ' ' + sizes[i]
  }

  return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i]
}

/**
 * Obtém a estrutura hierárquica de um diretório com tamanhos
 * @param {string} dirPath - Caminho do diretório
 * @param {number} maxDepth - Profundidade máxima (padrão: infinito)
 * @param {number} currentDepth - Profundidade atual (interno)
 * @param {boolean} onlyDirectories - Se true, mostra apenas pastas (padrão: true)
 * @returns {object} Estrutura de diretório
 */
const getDirectoryStructure = (dirPath, maxDepth = Infinity, currentDepth = 0, onlyDirectories = true) => {
  if (!fs.existsSync(dirPath)) {
    throw new Error(`Diretório não existe: ${dirPath}`)
  }

  const stats = fs.statSync(dirPath)
  const name = path.basename(dirPath) || dirPath

  const structure = {
    name,
    path: dirPath,
    size: 0,
    children: [],
    isDirectory: stats.isDirectory(),
  }

  if (!stats.isDirectory()) {
    structure.size = stats.size
    return structure
  }

  if (currentDepth >= maxDepth) {
    return structure
  }

  try {
    const files = fs.readdirSync(dirPath)

    files.forEach((file) => {
      const filePath = path.join(dirPath, file)

      try {
        const fileStats = fs.statSync(filePath)
        let childSize = 0

        if (fileStats.isDirectory()) {
          const childStructure = getDirectoryStructure(
            filePath,
            maxDepth,
            currentDepth + 1,
            onlyDirectories
          )
          structure.children.push(childStructure)
          childSize = childStructure.size
        } else {
          // Se onlyDirectories é true, conta o tamanho mas não adiciona à lista
          childSize = fileStats.size
          if (!onlyDirectories) {
            structure.children.push({
              name: file,
              path: filePath,
              size: fileStats.size,
              isDirectory: false,
            })
          }
        }

        structure.size += childSize
      } catch (err) {
        console.warn(`Erro ao acessar: ${filePath}`, err.message)
      }
    })

    // Ordenar por tamanho (maior primeiro)
    structure.children.sort((a, b) => b.size - a.size)

    // Adicionar percentual de ocupação
    structure.children.forEach((child) => {
      if (structure.size > 0) {
        child.percentage = ((child.size / structure.size) * 100).toFixed(2)
      } else {
        child.percentage = 0
      }
    })
  } catch (err) {
    throw new Error(`Erro ao ler diretório: ${err.message}`)
  }

  return structure
}

/**
 * Obtém estrutura de diretório com proteção contra DoS (VERSÃO ASYNC)
 * CRÍTICO #4: Usa fs.promises para não bloquear event loop
 * Implementa limites de profundidade, quantidade de items, timeout e symlinks
 * @param {string} dirPath - Caminho do diretório
 * @param {object} options - Opções de proteção
 * @param {number} options.maxDepth - Profundidade máxima (padrão: 5)
 * @param {number} options.maxItems - Máximo de items a processar (padrão: 10000)
 * @param {number} options.timeout - Timeout em ms (padrão: 30000)
 * @param {boolean} options.followSymlinks - Seguir symlinks (padrão: false)
 * @param {boolean} options.onlyDirectories - Mostrar apenas pastas (padrão: true)
 * @returns {Promise<object>} Estrutura de diretório com proteções aplicadas
 */
const getDirectoryStructureWithLimits = async (
  dirPath,
  options = {}
) => {
  // Validar path
  if (!dirPath || typeof dirPath !== 'string') {
    throw new Error('Caminho inválido')
  }

  if (!fs.existsSync(dirPath)) {
    throw new Error(`Diretório não existe: ${dirPath}`)
  }

  // Opções com valores padrão seguros
  const {
    maxDepth = 5,
    maxItems = 10000,
    timeout = 30000,
    followSymlinks = false,
    onlyDirectories = true,
  } = options

  // Validar opções
  if (maxDepth < 1 || maxDepth > 100) {
    throw new Error('maxDepth deve estar entre 1 e 100')
  }
  if (maxItems < 1 || maxItems > 1000000) {
    throw new Error('maxItems deve estar entre 1 e 1000000')
  }
  if (timeout < 1000 || timeout > 300000) {
    throw new Error('timeout deve estar entre 1000ms e 300000ms')
  }

  // Controle de execução
  const executionContext = {
    startTime: Date.now(),
    itemsProcessed: 0,
    symlinkDetected: false,
    truncated: false,
    visitedPaths: new Set(),
  }

  // Função interna recursiva com proteções (async)
  const traverse = async (dirPath, currentDepth = 0) => {
    // Verificar timeout
    if (Date.now() - executionContext.startTime > timeout) {
      const error = new Error('Análise de diretório expirou (timeout)')
      error.code = 'TIMEOUT'
      throw error
    }

    // Verificar limite de profundidade
    if (currentDepth >= maxDepth) {
      executionContext.truncated = true
      return null
    }

    // Verificar limite de items processados
    if (executionContext.itemsProcessed >= maxItems) {
      executionContext.truncated = true
      return null
    }

    // Verificar symlinks cíclicos
    const realPath = fs.realpathSync(dirPath)
    if (executionContext.visitedPaths.has(realPath)) {
      executionContext.symlinkDetected = true
      return null
    }

    if (!followSymlinks) {
      executionContext.visitedPaths.add(realPath)
    }

    if (!fs.existsSync(dirPath)) {
      throw new Error(`Diretório não existe: ${dirPath}`)
    }

    try {
      const stats = await fsPromises.lstat(dirPath) // lstat não segue symlinks
      const name = path.basename(dirPath) || dirPath

      const structure = {
        name,
        path: dirPath,
        size: 0,
        children: [],
        isDirectory: stats.isDirectory(),
        isSymlink: stats.isSymbolicLink(),
        truncated: false,
      }

      if (!stats.isDirectory()) {
        structure.size = stats.size
        executionContext.itemsProcessed++
        return structure
      }

      // Se é symlink e não deve seguir, retornar
      if (stats.isSymbolicLink() && !followSymlinks) {
        executionContext.symlinkDetected = true
        return structure
      }

      try {
        // CRÍTICO #4: Usar fs.promises.readdir ao invés de fs.readdirSync
        const files = await fsPromises.readdir(dirPath)

        // Limitar quantidade de files por diretório
        for (let i = 0; i < files.length; i++) {
          if (executionContext.itemsProcessed >= maxItems) {
            structure.truncated = true
            executionContext.truncated = true
            break
          }

          const file = files[i]
          const filePath = path.join(dirPath, file)

          try {
            const fileStats = await fsPromises.lstat(filePath)
            let childSize = 0

            if (fileStats.isDirectory() && !fileStats.isSymbolicLink()) {
              const childStructure = await traverse(filePath, currentDepth + 1)
              if (childStructure) {
                structure.children.push(childStructure)
                childSize = childStructure.size
                executionContext.itemsProcessed++
              }
            } else if (fileStats.isSymbolicLink()) {
              executionContext.symlinkDetected = true
              if (followSymlinks) {
                const childStructure = await traverse(filePath, currentDepth + 1)
                if (childStructure) {
                  structure.children.push(childStructure)
                  childSize = childStructure.size
                  executionContext.itemsProcessed++
                }
              }
            } else {
              // Arquivo regular
              childSize = fileStats.size
              if (!onlyDirectories) {
                structure.children.push({
                  name: file,
                  path: filePath,
                  size: fileStats.size,
                  isDirectory: false,
                  isSymlink: false,
                })
                executionContext.itemsProcessed++
              }
            }

            structure.size += childSize
          } catch (err) {
            console.warn(`Erro ao acessar: ${filePath}`, err.message)
          }
        }

        // Ordenar por tamanho
        structure.children.sort((a, b) => b.size - a.size)

        // Adicionar percentual
        structure.children.forEach((child) => {
          if (structure.size > 0) {
            child.percentage = ((child.size / structure.size) * 100).toFixed(2)
          } else {
            child.percentage = 0
          }
        })
      } catch (err) {
        console.warn(`Erro ao ler diretório: ${dirPath}`, err.message)
      }

      return structure
    } catch (error) {
      throw error
    }
  }

  // Executar traversal
  const structure = await traverse(dirPath, 0)

  // Adicionar metadados de proteção
  structure._protection = {
    maxDepth,
    maxItems,
    timeout,
    followSymlinks,
    itemsProcessed: executionContext.itemsProcessed,
    timeElapsed: Date.now() - executionContext.startTime,
    symlinkDetected: executionContext.symlinkDetected,
  }

  structure.truncated = executionContext.truncated
  if (executionContext.symlinkDetected) {
    structure.symlinkWarning = 'Symlinks foram detectados e ignorados'
  }

  return structure
}

module.exports = {
  calculateDirectorySize,
  formatBytes,
  getDirectoryStructure,
  getDirectoryStructureWithLimits,
}
