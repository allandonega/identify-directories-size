// backend/tests/unit/controllers/directoryController.test.js
const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')
jest.mock('child_process')

const {
  analyzeDirectory,
  openDirectory,
  healthCheck,
} = require('../../../src/controllers/directoryController')

describe('DirectoryController', () => {
  const fixtureDir = path.join(__dirname, '../../fixtures/test-directory')

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('analyzeDirectory', () => {
    it('deve retornar estrutura de diretório válida', () => {
      const req = { body: { path: fixtureDir } }
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      }

      analyzeDirectory(req, res)

      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalled()

      const response = res.json.mock.calls[0][0]
      expect(response).toHaveProperty('success')
      expect(response).toHaveProperty('data')
      expect(response.success).toBe(true)
    })

    it('deve retornar erro 400 para caminho inválido', () => {
      const req = { body: { path: '' } }
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      }

      analyzeDirectory(req, res)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalled()

      const response = res.json.mock.calls[0][0]
      expect(response.success).toBe(false)
      expect(response.error).toBe('INVALID_PATH')
    })

    it('deve retornar erro 404 para diretório que não existe', () => {
      const req = { body: { path: '/nonexistent/path/12345' } }
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      }

      analyzeDirectory(req, res)

      expect(res.status).toHaveBeenCalledWith(404)
    })

    it('deve retornar erro 400 se caminho é null ou undefined', () => {
      const req = { body: { path: null } }
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      }

      analyzeDirectory(req, res)

      expect(res.status).toHaveBeenCalledWith(400)
    })

    it('deve retornar erro 400 se caminho é arquivo, não diretório', () => {
      // Usar um arquivo existente (o próprio arquivo de teste)
      const filePath = __filename
      const req = { body: { path: filePath } }
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      }

      analyzeDirectory(req, res)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalled()

      const response = res.json.mock.calls[0][0]
      expect(response.error).toBe('NOT_A_DIRECTORY')
    })

    it('deve retornar erro 500 para erro inesperado do sistema de arquivos', () => {
      const req = { body: { path: fixtureDir } }
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      }

      const originalReaddirSync = fs.readdirSync
      fs.readdirSync = () => { throw new Error('Erro de sistema') }

      analyzeDirectory(req, res)

      fs.readdirSync = originalReaddirSync

      expect(res.status).toHaveBeenCalledWith(500)
      const response = res.json.mock.calls[0][0]
      expect(response.success).toBe(false)
    })
  })

  describe('openDirectory', () => {
    it('deve retornar 200 para caminho válido', (done) => {
      const req = { body: { path: fixtureDir } }
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      }

      // Mock do exec para sucesso
      const { exec } = require('child_process')
      exec.mockImplementation((cmd, callback) => {
        setTimeout(() => callback(null), 10)
      })

      openDirectory(req, res)

      // Aguardar callback assíncrono
      setTimeout(() => {
        expect(res.status).toHaveBeenCalledWith(200)
        done()
      }, 50)
    })

    it('deve retornar erro para caminho inválido', () => {
      const req = { body: { path: '' } }
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      }

      openDirectory(req, res)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalled()
    })

    it('deve retornar erro se diretório não existe', () => {
      const req = { body: { path: '/nonexistent/path/12345' } }
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      }

      openDirectory(req, res)

      expect(res.status).toHaveBeenCalledWith(404)
    })

    it('deve retornar erro para null ou undefined', () => {
      const req = { body: { path: null } }
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      }

      openDirectory(req, res)

      expect(res.status).toHaveBeenCalledWith(400)
    })

    it('deve retornar erro 500 se exec falha', (done) => {
      const req = { body: { path: fixtureDir } }
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      }

      // Mock do exec para erro
      const { exec } = require('child_process')
      exec.mockImplementation((cmd, callback) => {
        setTimeout(() => callback(new Error('Command failed')), 10)
      })

      openDirectory(req, res)

      setTimeout(() => {
        expect(res.status).toHaveBeenCalledWith(500)
        done()
      }, 50)
    })

    it('deve retornar 500 para erro inesperado antes do exec', () => {
      const req = { body: { path: fixtureDir } }
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      }

      const originalExistsSync = fs.existsSync
      fs.existsSync = () => { throw new Error('FS inesperado') }

      openDirectory(req, res)

      fs.existsSync = originalExistsSync

      expect(res.status).toHaveBeenCalledWith(500)
      const response = res.json.mock.calls[0][0]
      expect(response.success).toBe(false)
    })
  })

  describe('healthCheck', () => {
    it('deve retornar status ok', () => {
      const req = {}
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      }

      healthCheck(req, res)

      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalled()

      const response = res.json.mock.calls[0][0]
      expect(response.status).toBe('ok')
      expect(response).toHaveProperty('timestamp')
      expect(response).toHaveProperty('version')
    })
  })
})
