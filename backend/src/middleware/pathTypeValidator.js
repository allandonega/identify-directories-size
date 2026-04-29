// backend/src/middleware/pathTypeValidator.js
/**
 * Middleware para validar que 'path' no body é string
 * Previne erros ao tentar passar objeto, array, número, etc.
 */
const pathTypeValidator = (req, res, next) => {
  // Aplicar apenas em rotas que esperam 'path'
  if (req.body && req.body.path !== undefined) {
    const { path: dirPath } = req.body

    // Validar tipo
    if (typeof dirPath !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'INVALID_PATH',
        message: 'Path deve ser uma string',
        statusCode: 400,
      })
    }

    // Validar se está vazio ou apenas espaços
    if (!dirPath || dirPath.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'INVALID_PATH',
        message: 'Path não pode estar vazio',
        statusCode: 400,
      })
    }
  }

  next()
}

module.exports = pathTypeValidator
