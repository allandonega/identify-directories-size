// backend/src/services/directoryService.js
const fs = require('fs')
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

module.exports = {
  calculateDirectorySize,
  formatBytes,
  getDirectoryStructure,
}
