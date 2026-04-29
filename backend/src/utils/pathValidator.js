/**
 * Validador de caminhos com proteção contra Path Traversal
 * @module pathValidator
 */

const path = require('path')
const fs = require('fs')

/**
 * Valida se o caminho é seguro (sem path traversal)
 * @param {string} dirPath - Caminho a validar
 * @param {string[]} allowedPaths - Lista de caminhos permitidos (whitelist)
 * @returns {boolean} True se o caminho é válido e seguro
 */
const isValidPath = (dirPath, allowedPaths = []) => {
  // Validação básica de tipo e vazio
  if (!dirPath || typeof dirPath !== 'string' || dirPath.trim() === '') {
    return false
  }

  // Resolver para caminho absoluto
  const normalizedPath = path.resolve(dirPath)

  // Se allowedPaths está configurado, validar contra whitelist
  if (allowedPaths && allowedPaths.length > 0) {
    const isAllowed = allowedPaths.some((allowedPath) => {
      const resolvedAllowed = path.resolve(allowedPath)
      // Verificar se o path começa com um dos allowed paths
      return (
        normalizedPath === resolvedAllowed ||
        normalizedPath.startsWith(resolvedAllowed + path.sep)
      )
    })

    if (!isAllowed) {
      return false
    }
  }
  // Se allowedPaths está vazio, apenas fazer validação de segurança

  // Detectar tentativas de path traversal
  // Verificar se path contém .. (parent directory)
  const parts = normalizedPath.split(path.sep)
  if (parts.includes('..')) {
    return false
  }

  // Verificar se path normalizado é diferente do path original
  // isso poderia indicar tentativa de escape
  const resolvedPath = path.resolve(normalizedPath)
  if (resolvedPath !== normalizedPath) {
    return false
  }

  return true
}

/**
 * Valida path e verifica se existe e é diretório
 * @param {string} dirPath - Caminho a validar
 * @param {string[]} allowedPaths - Lista de caminhos permitidos (whitelist)
 * @returns {object} { isValid: boolean, error: string | null }
 */
const validatePathSecurity = (dirPath, allowedPaths = []) => {
  // Validação básica
  if (!dirPath || typeof dirPath !== 'string' || dirPath.trim() === '') {
    return {
      isValid: false,
      error: 'INVALID_PATH',
      message: 'Caminho do diretório é inválido ou vazio',
    }
  }

  // Validação de segurança (path traversal)
  if (!isValidPath(dirPath, allowedPaths)) {
    return {
      isValid: false,
      error: 'FORBIDDEN_PATH',
      message: 'Acesso a este caminho não é permitido',
    }
  }

  // Verificar se existe
  if (!fs.existsSync(dirPath)) {
    return {
      isValid: false,
      error: 'NOT_FOUND',
      message: `Diretório não encontrado: ${dirPath}`,
    }
  }

  // Verificar se é diretório
  try {
    const stats = fs.statSync(dirPath)
    if (!stats.isDirectory()) {
      return {
        isValid: false,
        error: 'NOT_A_DIRECTORY',
        message: 'O caminho fornecido não é um diretório',
      }
    }
  } catch (error) {
    return {
      isValid: false,
      error: 'PERMISSION_DENIED',
      message: 'Sem permissão para acessar este caminho',
    }
  }

  return {
    isValid: true,
    error: null,
  }
}

module.exports = {
  isValidPath,
  validatePathSecurity,
}
