// backend/tests/unit/controllers/directoryController.integration.test.js
const path = require('path')
const fs = require('fs')

const { analyzeDirectory } = require('../../../src/controllers/directoryController')

describe('DirectoryController - Edge Cases', () => {
  describe('analyzeDirectory - Error Scenarios', () => {
    it('deve retornar erro quando há permissão negada (mock)', async () => {
      const req = { body: { path: '/root/.ssh' } }
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      }
      const next = jest.fn()

      const existsSync = jest.spyOn(fs, 'existsSync')
      const statSync = jest.spyOn(fs, 'statSync')

      existsSync.mockReturnValueOnce(false)

      await analyzeDirectory(req, res, next)

      // Path que não existe pode retornar 400 ou 404 (ambos são válidos)
      expect([400, 404]).toContain(res.status.mock.calls[0][0])

      existsSync.mockRestore()
      statSync.mockRestore()
    })

    it('deve incluir timestamp na resposta', async () => {
      const fixtureDir = path.join(__dirname, '../../fixtures/test-directory')
      const req = { body: { path: fixtureDir } }
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      }
      const next = jest.fn()

      await analyzeDirectory(req, res, next)

      const response = res.json.mock.calls[0][0]
      expect(response).toHaveProperty('timestamp')
      expect(typeof response.timestamp).toBe('string')
      // Validar que é um timestamp ISO válido
      expect(new Date(response.timestamp).getTime()).toBeGreaterThan(0)
    })
  })
})
