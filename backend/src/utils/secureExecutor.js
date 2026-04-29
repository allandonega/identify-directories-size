/**
 * Executor seguro para abrir diretórios
 * Protege contra Command Injection usando execFile
 * @module secureExecutor
 */

const { execFile } = require('child_process')
const path = require('path')
const fs = require('fs')

/**
 * Caracteres perigosos que podem indicar tentativa de injection
 */
const DANGEROUS_CHARS = /[&|;<>`$()\n\r]/

/**
 * Valida se path contém caracteres perigosos
 * @param {string} dirPath - Caminho a validar
 * @returns {boolean} True se contém caracteres perigosos
 */
const containsDangerousChars = (dirPath) => {
  return DANGEROUS_CHARS.test(dirPath)
}

/**
 * Abre um diretório de forma segura usando execFile
 * @param {string} dirPath - Caminho do diretório
 * @param {boolean} dryRun - Se true, não executa realmente (apenas valida)
 * @returns {Promise<void>}
 * @throws {Error} Se path contém caracteres perigosos ou não existe
 */
const safeOpenDirectory = (dirPath, dryRun = false) => {
  return new Promise((resolve, reject) => {
    // Validação básica
    if (!dirPath || typeof dirPath !== 'string') {
      const error = new Error('Path é obrigatório e deve ser uma string')
      error.code = 'INVALID_PATH'
      reject(error)
      return
    }

    // Detectar command injection
    if (containsDangerousChars(dirPath)) {
      const error = new Error(
        `Caminho contém caracteres não permitidos: ${dirPath}`
      )
      error.code = 'INJECTION_DETECTED'
      console.warn(`[SECURITY] Tentativa de command injection detectada: ${dirPath}`)
      reject(error)
      return
    }

    // Validar path normalizando
    const normalizedPath = path.resolve(dirPath)

    // Verificar se existe
    if (!fs.existsSync(normalizedPath)) {
      const error = new Error(`Diretório não encontrado: ${normalizedPath}`)
      error.code = 'NOT_FOUND'
      reject(error)
      return
    }

    // Verificar se é diretório
    try {
      const stats = fs.statSync(normalizedPath)
      if (!stats.isDirectory()) {
        const error = new Error(
          `Caminho não é um diretório: ${normalizedPath}`
        )
        error.code = 'NOT_A_DIRECTORY'
        reject(error)
        return
      }
    } catch (error) {
      error.code = 'PERMISSION_DENIED'
      reject(error)
      return
    }

    // Se é apenas validação (dry-run), resolver aqui
    if (dryRun) {
      resolve()
      return
    }

    // Executar comando apropriado para o SO usando execFile (seguro contra injection)
    const platform = process.platform
    let command
    let args = []

    /* istanbul ignore next */
    if (platform === 'win32') {
      // Windows: usar explorer.exe
      command = 'explorer.exe'
      args = [normalizedPath]
    } else if (platform === 'darwin') {
      // macOS: usar open
      command = 'open'
      args = [normalizedPath]
    } else {
      // Linux: usar xdg-open
      command = 'xdg-open'
      args = [normalizedPath]
    }

    // execFile não interpreta shell, passando args separadamente
    execFile(command, args, (error) => {
      if (error) {
        // Não expor detalhes de erro em produção
        console.error(`[ERROR] Falha ao abrir diretório: ${error.code}`)
        const err = new Error('Falha ao abrir o diretório')
        err.code = 'OPEN_FAILED'
        reject(err)
        return
      }

      resolve()
    })
  })
}

module.exports = {
  safeOpenDirectory,
  containsDangerousChars,
}
