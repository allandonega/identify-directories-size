// backend/src/routes/directoryRoutes.js
const express = require('express')
const {
  analyzeDirectory,
  openDirectory,
  healthCheck,
} = require('../controllers/directoryController')

const router = express.Router()

/**
 * Rotas da API v1
 */

// Health check
router.get('/health', healthCheck)

// Análise de diretório
router.post('/analyze', analyzeDirectory)

// Abrir diretório
router.post('/open', openDirectory)

module.exports = router
