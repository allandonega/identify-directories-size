// backend/src/middleware/requestTimeout.js
/**
 * Middleware para adicionar timeout em requisições
 * Previne requisições que ficam penduradas indefinidamente
 */
const requestTimeout = (timeoutMs = 60000) => {
  return (req, res, next) => {
    // Configurar timeout na requisição
    req.setTimeout(timeoutMs, () => {
      console.warn(`Requisição expirou após ${timeoutMs}ms: ${req.method} ${req.path}`)

      if (!res.headersSent) {
        res.status(408).json({
          success: false,
          error: 'REQUEST_TIMEOUT',
          message: `Requisição expirou após ${timeoutMs}ms`,
          statusCode: 408,
        })
      }

      // Abortar requisição
      req.socket.destroy()
    })

    // Também configurar no socket para ser mais agressivo
    req.socket.setTimeout(timeoutMs)

    next()
  }
}

module.exports = requestTimeout
