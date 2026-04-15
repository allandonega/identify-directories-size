// backend/src/controllers/directoryController.js
const fs = require('fs')
const path = require('path')
const { exec } = require('child_process')
const {
  calculateDirectorySize,
  formatBytes,
  getDirectoryStructure,
} = require('../services/directoryService')

/**
 * Valida se o caminho é seguro
 * @param {string} dirPath - Caminho a validar
 * @returns {boolean}
 */
const isValidPath = (dirPath) => {
  // Validação básica de tipo e vazio
  if (!dirPath || typeof dirPath !== 'string' || dirPath.trim() === '') {
    return false
  }

  return true
}

/**
 * Analisa um diretório e retorna sua estrutura com tamanhos
 * POST /api/v1/analyze
 */
const analyzeDirectory = (req, res) => {
  try {
    const { path: dirPath } = req.body

    if (!isValidPath(dirPath)) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_PATH',
        message: 'Caminho do diretório é inválido ou vazio',
        statusCode: 400,
      })
    }

    const normalizedPath = path.resolve(dirPath)

    if (!fs.existsSync(normalizedPath)) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: `Diretório não encontrado: ${normalizedPath}`,
        statusCode: 404,
      })
    }

    const stats = fs.statSync(normalizedPath)
    if (!stats.isDirectory()) {
      return res.status(400).json({
        success: false,
        error: 'NOT_A_DIRECTORY',
        message: 'O caminho fornecido não é um diretório',
        statusCode: 400,
      })
    }

    // Obter estrutura do diretório
    const structure = getDirectoryStructure(normalizedPath)

    // Formatar tamanhos
    const formatStructure = (node) => {
      return {
        ...node,
        sizeFormatted: formatBytes(node.size),
        children: (node.children || []).map((child) => formatStructure(child)),
      }
    }

    const formattedStructure = formatStructure(structure)

    res.status(200).json({
      success: true,
      data: formattedStructure,
      message: 'Análise concluída com sucesso',
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Erro na análise:', error)

    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: error.message || 'Erro ao analisar diretório',
      statusCode: 500,
    })
  }
}

/**
 * Abre um diretório no explorador do sistema
 * POST /api/v1/open
 */
const openDirectory = (req, res) => {
  try {
    const { path: dirPath } = req.body

    if (!isValidPath(dirPath)) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_PATH',
        message: 'Caminho do diretório é inválido ou vazio',
        statusCode: 400,
      })
    }

    const normalizedPath = path.resolve(dirPath)

    if (!fs.existsSync(normalizedPath)) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: `Diretório não encontrado: ${normalizedPath}`,
        statusCode: 404,
      })
    }

    // Detectar SO e abrir com comando apropriado
    const platform = process.platform
    let command

    if (platform === 'win32') {
      // Windows
      command = `start "" "${normalizedPath}"`
    } else if (platform === 'darwin') {
      // macOS
      command = `open "${normalizedPath}"`
    } else {
      // Linux
      command = `xdg-open "${normalizedPath}"`
    }

    // Executar comando assincronamente
    exec(command, (error) => {
      if (error) {
        console.error('Erro ao abrir diretório:', error)
        return res.status(500).json({
          success: false,
          error: 'OPEN_FAILED',
          message: 'Não foi possível abrir o diretório',
          statusCode: 500,
        })
      }

      res.status(200).json({
        success: true,
        data: {
          path: normalizedPath,
          opened: true,
        },
        message: 'Diretório aberto com sucesso',
        timestamp: new Date().toISOString(),
      })
    })
  } catch (error) {
    console.error('Erro ao abrir diretório:', error)

    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: error.message || 'Erro interno do servidor',
      statusCode: 500,
    })
  }
}

/**
 * Health check da API
 * GET /api/v1/health
 */
const healthCheck = (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  })
}

module.exports = {
  analyzeDirectory,
  openDirectory,
  healthCheck,
}
