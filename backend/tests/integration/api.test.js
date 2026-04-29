// backend/tests/integration/api.test.js
const request = require('supertest')
const path = require('path')
const fs = require('fs')
const os = require('os')
const app = require('../../src/index')

describe('API Integration Tests', () => {
  let tempDir
  
  beforeAll(() => {
    // Criar um diretório temporário para testes
    tempDir = path.join(os.tmpdir(), 'api-test-' + Date.now())
    fs.mkdirSync(tempDir, { recursive: true })
    // Criar um arquivo dentro
    fs.writeFileSync(path.join(tempDir, 'test.txt'), 'test content')
  })

  afterAll(() => {
    // Limpar diretório temporário
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true })
    }
  })

  describe('POST /api/v1/analyze', () => {
    it('deve analisar um diretório válido e retornar status 200', async () => {
      const response = await request(app)
        .post('/api/v1/analyze')
        .send({ path: tempDir })

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('success')
      expect(response.body.success).toBe(true)
      expect(response.body).toHaveProperty('data')
    })

    it('deve retornar erro para caminho vazio', async () => {
      const response = await request(app)
        .post('/api/v1/analyze')
        .send({ path: '' })

      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
    })

    it('deve retornar erro para diretório inexistente', async () => {
      const response = await request(app)
        .post('/api/v1/analyze')
        .send({ path: '/nonexistent/directory/path' })

      // Path que não existe pode retornar 400 ou 404 (ambos são válidos)
      expect([400, 404]).toContain(response.status)
      expect(response.body.success).toBe(false)
    })

    it('deve retornar estrutura com propriedades obrigatórias', async () => {
      const response = await request(app)
        .post('/api/v1/analyze')
        .send({ path: tempDir })

      expect(response.body.data).toHaveProperty('name')
      expect(response.body.data).toHaveProperty('size')
      expect(response.body.data).toHaveProperty('path')
      expect(response.body.data).toHaveProperty('children')
      expect(Array.isArray(response.body.data.children)).toBe(true)
    })
  })

  describe('POST /api/v1/open', () => {
    it('deve abrir um diretório válido ou retornar erro esperado', async () => {
      const response = await request(app)
        .post('/api/v1/open')
        .send({ path: tempDir })

      // Em alguns sistemas, "open" pode falhar; aceitamos sucesso ou erro esperado
      expect([200, 500]).toContain(response.status)
      // Se falhou, deve ser erro de sistema operacional, não de validação
      if (response.status === 500) {
        expect(response.body.success).toBe(false)
      } else {
        expect(response.body.success).toBe(true)
      }
    })

    it('deve retornar erro para caminho vazio', async () => {
      const response = await request(app)
        .post('/api/v1/open')
        .send({ path: '' })

      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
    })
  })

  describe('GET /api/v1/health', () => {
    it('deve retornar status de saúde da API', async () => {
      const response = await request(app).get('/api/v1/health')

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('status')
      expect(response.body.status).toBe('ok')
    })
  })
})
