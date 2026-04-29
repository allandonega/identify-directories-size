// backend/src/middleware/secureErrorHandler.js
/**
 * Middleware de tratamento de erro global SEGURO
 * Não expõe stack traces ou detalhes internos
 */
const secureErrorHandler = (err, req, res, next) => {
  // Registrar erro completo internamente para debugging/monitoring
  // NÃO incluir stack trace em produção
  const isDevelopment = process.env.NODE_ENV === 'development'
  
  const logData = {
    code: err.code,
    message: err.message,
    url: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString(),
  }
  
  // Adicionar stack trace APENAS em development
  if (isDevelopment) {
    logData.stack = err.stack
  }
  
  console.error('[ERROR]', logData)

  // Nunca enviar stack trace ao cliente
  // Nunca enviar caminhos de arquivo ao cliente
  
  // Preparar mensagem segura
  let statusCode = 500
  let errorCode = 'INTERNAL_SERVER_ERROR'
  let message = 'Erro interno do servidor'

  // Mapeamento de erros conhecidos
  if (err.code === 'INVALID_PATH') {
    statusCode = 400
    errorCode = 'INVALID_PATH'
    message = 'Caminho inválido'
  } else if (err.code === 'INJECTION_DETECTED') {
    statusCode = 400
    errorCode = 'INJECTION_DETECTED'
    message = 'Padrão suspeito detectado no caminho'
  } else if (err.code === 'NOT_FOUND') {
    statusCode = 404
    errorCode = 'NOT_FOUND'
    message = 'Recurso não encontrado'
  } else if (err.code === 'PERMISSION_DENIED') {
    statusCode = 403
    errorCode = 'PERMISSION_DENIED'
    message = 'Permissão negada'
  } else if (err.code === 'REQUEST_TIMEOUT') {
    statusCode = 408
    errorCode = 'REQUEST_TIMEOUT'
    message = 'Requisição expirou'
  } else if (err.statusCode) {
    statusCode = err.statusCode
    errorCode = err.code || 'ERROR'
  }

  // Em desenvolvimento, incluir mais detalhes
  if (isDevelopment) {
    message = err.message || message
  }

  // Responder com erro seguro
  res.status(statusCode).json({
    success: false,
    error: errorCode,
    message: message,
    statusCode: statusCode,
    timestamp: new Date().toISOString(),
  })
}

module.exports = secureErrorHandler
