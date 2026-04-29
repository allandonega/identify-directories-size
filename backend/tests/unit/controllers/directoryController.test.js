// backend/tests/unit/controllers/directoryController.test.js
const fs = require('fs')
const path = require('path')

jest.mock('../../../src/utils/secureExecutor')
jest.mock('child_process')

const {
  analyzeDirectory,
  openDirectory,
  healthCheck,
} = require('../../../src/controllers/directoryController')
const { safeOpenDirectory } = require('../../../src/utils/secureExecutor')

describe('DirectoryController', () => {
  const fixtureDir = path.join(__dirname, '../../fixtures/test-directory')

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('analyzeDirectory', () => {
    it('deve retornar estrutura de diretório válida', async () => {
      const req = { body: { path: fixtureDir } }
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      }

      // Como analyzeDirectory é async, precisa await
      await analyzeDirectory(req, res)

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

    it('deve retornar erro para diretório que não existe', () => {
      const req = { body: { path: '/nonexistent/path/12345' } }
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      }

      analyzeDirectory(req, res)

      // Path que não existe pode retornar 400 ou 404 (ambos são válidos)
      expect([400, 404]).toContain(res.status.mock.calls[0][0])
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
  })

  describe('openDirectory', () => {
    it('deve retornar 200 para caminho válido', async () => {
      const req = { body: { path: fixtureDir } }
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      }

      // Mock da safeOpenDirectory para sucesso
      safeOpenDirectory.mockResolvedValueOnce()

      await openDirectory(req, res)

      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalled()
    })

    it('deve retornar erro para caminho inválido', async () => {
      const req = { body: { path: '' } }
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      }

      await openDirectory(req, res)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalled()
    })

    it('deve retornar erro se diretório não existe', async () => {
      const req = { body: { path: '/nonexistent/path/12345' } }
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      }

      await openDirectory(req, res)

      // Path que não existe pode retornar 400 ou 404 (ambos são válidos)
      expect([400, 404]).toContain(res.status.mock.calls[0][0])
    })

    it('deve retornar erro para null ou undefined', async () => {
      const req = { body: { path: null } }
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      }

      await openDirectory(req, res)

      expect(res.status).toHaveBeenCalledWith(400)
    })

    it('deve retornar erro 500 se safeOpenDirectory falha', async () => {
      const req = { body: { path: fixtureDir } }
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      }

      // Mock da safeOpenDirectory para erro
      const error = new Error('Command failed')
      error.code = 'OPEN_FAILED'
      safeOpenDirectory.mockRejectedValueOnce(error)

      await openDirectory(req, res)

      expect(res.status).toHaveBeenCalledWith(500)
    })

    it('deve retornar erro 400 se safeOpenDirectory detecta injection', async () => {
      const req = { body: { path: fixtureDir } }
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      }

      // Mock da safeOpenDirectory para detecção de injection
      const error = new Error('Injection detected')
      error.code = 'INJECTION_DETECTED'
      safeOpenDirectory.mockRejectedValueOnce(error)

      await openDirectory(req, res)

      expect(res.status).toHaveBeenCalledWith(400)
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
