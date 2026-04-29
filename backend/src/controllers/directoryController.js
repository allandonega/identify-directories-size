// backend/src/controllers/directoryController.js
const fs = require('fs')
const path = require('path')
const { formatBytes, getDirectoryStructureWithLimits } = require('../services/directoryService')
const { validatePathSecurity } = require('../utils/pathValidator')
const { safeOpenDirectory } = require('../utils/secureExecutor')

// Carregar allowed paths do .env
const ALLOWED_PATHS = process.env.ALLOWED_PATHS
  ? process.env.ALLOWED_PATHS.split(',').map((p) => p.trim())
  : process.env.NODE_ENV === 'production'
  ? [] // Em produção, EXIGIR configuração
  : [process.cwd(), require('os').homedir()] // Em dev, home + current dir

// CRÍTICO: Validar em startup se há paths permitidos em produção
if (process.env.NODE_ENV === 'production' && ALLOWED_PATHS.length === 0) {
  console.error('[SECURITY] ERRO: ALLOWED_PATHS vazio em produção!')
  console.error('[SECURITY] Configure ALLOWED_PATHS no arquivo .env')
}

/**
 * Analisa um diretório e retorna sua estrutura com tamanhos
 * POST /api/v1/analyze
 */
const analyzeDirectory = async (req, res, next) => {
  try {
    const { path: dirPath } = req.body

    // Validação robusta contra Path Traversal
    const validation = validatePathSecurity(dirPath, ALLOWED_PATHS)
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: validation.error,
        message: validation.message,
        statusCode: 400,
      })
    }

    // CRÍTICO #4: Agora é async e não bloqueia
    const structure = await getDirectoryStructureWithLimits(dirPath, {
      maxDepth: 5,
      maxItems: 10000,
      timeout: 30000,
      followSymlinks: false,
      onlyDirectories: true,
    })

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
    console.error('Erro na análise:', error.code || error.message)
    next(error) // Deixar o error handler global tratar (seguro)
  }
}

/**
 * Abre um diretório no explorador do sistema
 * POST /api/v1/open
 */
const openDirectory = async (req, res) => {
  try {
    const { path: dirPath } = req.body

    // Validação robusta contra Path Traversal
    const validation = validatePathSecurity(dirPath, ALLOWED_PATHS)
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: validation.error,
        message: validation.message,
        statusCode: 400,
      })
    }

    // Abrir diretório de forma segura (execFile - proteção contra injection)
    await safeOpenDirectory(dirPath)

    res.status(200).json({
      success: true,
      data: {
        path: dirPath,
        opened: true,
      },
      message: 'Diretório aberto com sucesso',
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error(`[ERROR] Erro ao abrir diretório: ${error.code}`)

    // Mapear código de erro para status HTTP apropriado
    let statusCode = 500
    if (error.code === 'INVALID_PATH' || error.code === 'INJECTION_DETECTED') {
      statusCode = 400
    } else if (error.code === 'NOT_FOUND') {
      statusCode = 404
    } else if (error.code === 'PERMISSION_DENIED') {
      statusCode = 403
    }

    // Não expor detalhes de erro em produção
    const isDev = process.env.NODE_ENV === 'development'
    const message = isDev ? error.message : 'Não foi possível abrir o diretório'

    res.status(statusCode).json({
      success: false,
      error: error.code || 'OPEN_FAILED',
      message,
      statusCode,
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
