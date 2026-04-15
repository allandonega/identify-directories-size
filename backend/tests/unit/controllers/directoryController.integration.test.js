// backend/tests/unit/controllers/directoryController.integration.test.js
const path = require('path')
const fs = require('fs')

const { analyzeDirectory } = require('../../../src/controllers/directoryController')

describe('DirectoryController - Edge Cases', () => {
  describe('analyzeDirectory - Error Scenarios', () => {
    it('deve retornar erro quando há permissão negada (mock)', () => {
      const req = { body: { path: '/root/.ssh' } } // Caminho que pode não ter permissão
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      }

      // Se o caminho existe, analisar; senão, retornará 404
      const existsSync = jest.spyOn(fs, 'existsSync')
      const statSync = jest.spyOn(fs, 'statSync')

      existsSync.mockReturnValueOnce(false)

      analyzeDirectory(req, res)

      expect(res.status).toHaveBeenCalledWith(404)

      existsSync.mockRestore()
      statSync.mockRestore()
    })

    it('deve incluir timestamp na resposta', () => {
      const fixtureDir = path.join(__dirname, '../../fixtures/test-directory')
      const req = { body: { path: fixtureDir } }
      const res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      }

      analyzeDirectory(req, res)

      const response = res.json.mock.calls[0][0]
      expect(response).toHaveProperty('timestamp')
      expect(typeof response.timestamp).toBe('string')
      // Validar que é um timestamp ISO válido
      expect(new Date(response.timestamp).getTime()).toBeGreaterThan(0)
    })
  })
})
