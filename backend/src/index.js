// backend/src/index.js
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const path = require('path')
require('dotenv').config()

const directoryRoutes = require('./routes/directoryRoutes')
const pathTypeValidator = require('./middleware/pathTypeValidator')
const requestTimeout = require('./middleware/requestTimeout')
const secureErrorHandler = require('./middleware/secureErrorHandler')

const app = express()
const PORT = process.env.PORT || 3000
const NODE_ENV = process.env.NODE_ENV || 'development'

// Validar configurações críticas em produção
if (NODE_ENV === 'production') {
  if (!process.env.ALLOWED_PATHS) {
    console.error('[SECURITY] ERRO: ALLOWED_PATHS não configurado em produção!')
    process.exit(1)
  }
}

// Middleware de segurança: Headers de segurança (Helmet)
app.use(helmet())

// Middleware: CORS com whitelist
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : ['http://localhost:3000', 'http://localhost:3001']

app.use(cors({
  origin: (origin, callback) => {
    // Permitir requisições sem origin (mobile, curl, etc)
    if (!origin) return callback(null, true)
    
    if (allowedOrigins.includes(origin) || NODE_ENV === 'development') {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

// Middleware: Rate limiting (proteção contra brute force/DoS)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máx 100 requisições por IP
  message: 'Muitas requisições de este IP, tente novamente mais tarde.',
  skip: (req) => NODE_ENV === 'development', // Não limitar em desenvolvimento
})
app.use(limiter)

// Middleware
app.use(express.json({ limit: '1mb' })) // Limitar tamanho do payload
app.use(express.urlencoded({ extended: true, limit: '1mb' }))

// Middleware de validação de tipo path
app.use(pathTypeValidator)

// Middleware de timeout em requisições
app.use(requestTimeout(60000))

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

// Middleware de autenticação obrigatório para API
const apiKeyAuth = (req, res, next) => {
  // Em testes, pular autenticação
  if (NODE_ENV === 'test') {
    return next()
  }
  
  // Obter API Key do header X-API-Key
  const apiKey = req.headers['x-api-key']
  const validApiKey = process.env.API_KEY
  
  // Em development, permitir sem chave (apenas se NODE_ENV === 'development' e API_KEY não configurado)
  if (NODE_ENV === 'development' && !validApiKey) {
    console.warn('[AUTH] API_KEY não configurado - permitindo requisições sem autenticação (DEVELOPMENT ONLY)')
    return next()
  }
  
  // Em produção ou quando API_KEY está configurado, exigir autenticação
  if (!apiKey || (validApiKey && apiKey !== validApiKey)) {
    return res.status(401).json({
      success: false,
      error: 'UNAUTHORIZED',
      message: 'API Key inválida ou não fornecida. Use header: X-API-Key',
      statusCode: 401,
    })
  }
  next()
}

// Rotas protegidas pela autenticação
app.use('/api/v1', apiKeyAuth)

// Rotas da API v1
app.use('/api/v1', directoryRoutes)

// Health check endpoint (sem autenticação para monitoramento)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
  })
})

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
app.use(secureErrorHandler)

// Iniciar servidor (apenas se não for ambiente de teste)
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(
      `🚀 Servidor rodando em http://localhost:${PORT} (${NODE_ENV})`
    )
  })
}

module.exports = app
