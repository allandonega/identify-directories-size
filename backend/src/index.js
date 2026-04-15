// backend/src/index.js
const express = require('express')
const cors = require('cors')
const path = require('path')
require('dotenv').config()

const directoryRoutes = require('./routes/directoryRoutes')

const app = express()
const PORT = process.env.PORT || 3000
const NODE_ENV = process.env.NODE_ENV || 'development'

// Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors())

// Servir arquivos estáticos do frontend
const frontendPath = path.join(__dirname, '../../frontend/public')
app.use(express.static(frontendPath))

// Middleware de logging em desenvolvimento
if (NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`)
    next()
  })
}

// Rotas da API v1
app.use('/api/v1', directoryRoutes)

// Rota raiz - servir index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'))
})

// Middleware de erro 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'NOT_FOUND',
    message: `Rota não encontrada: ${req.path}`,
    statusCode: 404,
  })
})

// Middleware de tratamento de erro global
app.use((err, req, res, next) => {
  console.error('Erro não tratado:', err)

  res.status(err.statusCode || 500).json({
    success: false,
    error: err.code || 'INTERNAL_ERROR',
    message: err.message || 'Erro interno do servidor',
    statusCode: err.statusCode || 500,
  })
})

// Iniciar servidor (apenas se não for ambiente de teste)
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(
      `🚀 Servidor rodando em http://localhost:${PORT} (${NODE_ENV})`
    )
  })
}

module.exports = app
