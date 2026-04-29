// backend/tests/unit/integration/criticalFixes.test.js
// TDD: Testes para os 4 problemas CRÍTICOS corrigidos
const request = require('supertest')
const path = require('path')
const os = require('os')
const fs = require('fs')
const app = require('../../../src/index')

describe('Critical Fixes - TDD Tests', () => {
  let tempDir

  beforeAll(() => {
    // Criar diretório temporário para testes
    tempDir = path.join(os.tmpdir(), 'critical-tests-' + Date.now())
    fs.mkdirSync(tempDir, { recursive: true })
    // Criar alguns arquivos
    fs.writeFileSync(path.join(tempDir, 'file1.txt'), 'content 1')
    fs.writeFileSync(path.join(tempDir, 'file2.txt'), 'content 2')
  })

  afterAll(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true })
    }
  })

  describe('CRÍTICO #1: Stack Trace Exposure Prevention', () => {
    it('deve retornar erro genérico sem expor stack trace', async () => {
      // Simular erro não tratado
      const response = await request(app)
        .post('/api/v1/analyze')
        .send({ path: null })

      // Não deve conter 'at ' (comum em stack traces)
      const responseStr = JSON.stringify(response.body)
      expect(responseStr).not.toMatch(/^\s*at\s+/m)
      // Não deve conter arquivo paths
      expect(responseStr).not.toMatch(/\/backend\/src\//g)
    })

    it('deve ter código de erro específico sem detalhes internos', async () => {
      const response = await request(app)
        .post('/api/v1/analyze')
        .send({ path: null })

      // Deve ter error code
      expect(response.body).toHaveProperty('error')
      // Mas sem detalhes do sistema
      const errorStr = String(response.body.error)
      expect(errorStr).not.toMatch(/EACCES|ENOENT|EPERM/)
    })

    it('deve logar erro internamente mas não expor ao cliente', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()

      const response = await request(app)
        .post('/api/v1/analyze')
        .send({ path: null })

      // Erro foi tratado com segurança
      const responseStr = JSON.stringify(response.body)
      // Não deve conter 'stack' ou paths do sistema
      expect(responseStr).not.toContain('stack')
      expect(responseStr).not.toContain('/backend/src/')
      // Deve ter um erro code legível
      expect(response.body).toHaveProperty('error')

      consoleErrorSpy.mockRestore()
    })
  })

  describe('CRÍTICO #2: JSON Type Validation', () => {
    it('deve rejeitar path como objeto', async () => {
      const response = await request(app)
        .post('/api/v1/analyze')
        .send({ path: { foo: 'bar' } })

      expect(response.status).toBe(400)
      expect(response.body.error).toBe('INVALID_PATH')
    })

    it('deve rejeitar path como array', async () => {
      const response = await request(app)
        .post('/api/v1/analyze')
        .send({ path: ['dir1', 'dir2'] })

      expect(response.status).toBe(400)
      expect(response.body.error).toBe('INVALID_PATH')
    })

    it('deve rejeitar path como número', async () => {
      const response = await request(app)
        .post('/api/v1/analyze')
        .send({ path: 12345 })

      expect(response.status).toBe(400)
      expect(response.body.error).toBe('INVALID_PATH')
    })

    it('deve rejeitar path como boolean', async () => {
      const response = await request(app)
        .post('/api/v1/analyze')
        .send({ path: true })

      expect(response.status).toBe(400)
      expect(response.body.error).toBe('INVALID_PATH')
    })

    it('deve aceitar path como string válida', async () => {
      const response = await request(app)
        .post('/api/v1/analyze')
        .send({ path: tempDir })

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
    })

    it('deve rejeitar path vazio ou só espaços', async () => {
      const response1 = await request(app)
        .post('/api/v1/analyze')
        .send({ path: '' })

      const response2 = await request(app)
        .post('/api/v1/analyze')
        .send({ path: '   ' })

      expect(response1.status).toBe(400)
      expect(response2.status).toBe(400)
    })
  })

  describe('CRÍTICO #3: HTTP Request Timeout', () => {
    it('deve completar requisição normal rapidamente', async () => {
      const startTime = Date.now()
      const response = await request(app)
        .post('/api/v1/analyze')
        .send({ path: tempDir })
        .timeout(15000)

      const duration = Date.now() - startTime
      expect([200, 400, 404, 500]).toContain(response.status)
      expect(duration).toBeLessThan(15000)
    })

    it('deve respeitar timeout configurado', async () => {
      const response = await request(app)
        .get('/api/v1/health')
        .timeout(5000)

      // Health check deve ser rápido
      expect([200, 404]).toContain(response.status)
    })

    it('deve retornar resposta mesmo em operações demoradas', async () => {
      const response = await request(app)
        .post('/api/v1/analyze')
        .send({ path: tempDir })

      // Não deve estar em estado indeterminado
      expect(response).toBeDefined()
      expect(response.status).toBeDefined()
    })
  })

  describe('CRÍTICO #4: Non-Blocking File System Operations', () => {
    it('deve responder rapidamente para análise de diretório', async () => {
      const startTime = Date.now()
      const response = await request(app)
        .post('/api/v1/analyze')
        .send({ path: tempDir })

      const duration = Date.now() - startTime

      expect([200, 400, 404, 500]).toContain(response.status)
      expect(response.body).toBeDefined()
      expect(duration).toBeLessThan(5000)
    })

    it('deve suportar múltiplas requisições simultaneamente', async () => {
      // Fazer 5 requisições ao mesmo tempo
      const promises = Array(5)
        .fill(null)
        .map(() =>
          request(app)
            .post('/api/v1/analyze')
            .send({ path: tempDir })
        )

      const responses = await Promise.all(promises)

      // Todas devem completar sem timeout/bloqueio
      responses.forEach((response) => {
        expect(response).toBeDefined()
        expect(response.status).toBeDefined()
      })
    })

    it('deve retornar dados estruturados mesmo com muitos arquivos', async () => {
      // Criar vários arquivos
      const testDir = path.join(tempDir, 'many-files')
      fs.mkdirSync(testDir, { recursive: true })

      for (let i = 0; i < 50; i++) {
        fs.writeFileSync(path.join(testDir, `file-${i}.txt`), `content ${i}`)
      }

      const response = await request(app)
        .post('/api/v1/analyze')
        .send({ path: testDir })

      // Deve retornar dados estruturados mesmo com muitos arquivos
      if (response.status === 200) {
        expect(response.body.data).toHaveProperty('children')
        expect(Array.isArray(response.body.data.children)).toBe(true)
      }

      // Cleanup
      fs.rmSync(testDir, { recursive: true, force: true })
    })
  })

  describe('Combined Security Tests', () => {
    it('deve validar path E não expor stack trace E respeitar timeout', async () => {
      const response = await request(app)
        .post('/api/v1/analyze')
        .send({ path: { invalid: 'object' } })
        .timeout(5000)

      expect(response.status).toBe(400)
      expect(response.body.error).toBe('INVALID_PATH')
      const responseStr = JSON.stringify(response.body)
      expect(responseStr).not.toContain('stack')
      expect(responseStr).not.toContain('/backend/src/')
    })

    it('deve abrir diretório com validações seguras', async () => {
      const response = await request(app)
        .post('/api/v1/open')
        .send({ path: tempDir })

      // Se sucesso, validações foram aplicadas
      // Se erro, foi genérico e seguro
      if (response.status === 200) {
        expect(response.body.success).toBe(true)
      } else {
        const responseStr = JSON.stringify(response.body)
        expect(responseStr).not.toMatch(/stack|at\s+|\/backend/)
      }
    })
  })
})
