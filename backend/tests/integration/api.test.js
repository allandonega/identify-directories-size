// backend/tests/integration/api.test.js
const request = require('supertest')
const path = require('path')
const app = require('../../src/index')

describe('API Integration Tests', () => {
  const fixtureDir = path.join(__dirname, '../fixtures/test-directory')

  describe('POST /api/v1/analyze', () => {
    it('deve analisar um diretório válido e retornar status 200', async () => {
      const response = await request(app)
        .post('/api/v1/analyze')
        .send({ path: fixtureDir })

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

      expect(response.status).toBe(404)
      expect(response.body.success).toBe(false)
    })

    it('deve retornar estrutura com propriedades obrigatórias', async () => {
      const response = await request(app)
        .post('/api/v1/analyze')
        .send({ path: fixtureDir })

      expect(response.body.data).toHaveProperty('name')
      expect(response.body.data).toHaveProperty('size')
      expect(response.body.data).toHaveProperty('path')
      expect(response.body.data).toHaveProperty('children')
      expect(Array.isArray(response.body.data.children)).toBe(true)
    })
  })

  describe('POST /api/v1/open', () => {
    it('deve abrir um diretório válido', async () => {
      const response = await request(app)
        .post('/api/v1/open')
        .send({ path: fixtureDir })

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
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
