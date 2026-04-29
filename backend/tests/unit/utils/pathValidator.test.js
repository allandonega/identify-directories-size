/**
 * Testes de segurança para Path Traversal
 * TDD: Testes primeiro, implementação depois
 */

const path = require('path')
const { isValidPath, validatePathSecurity } = require('../../../src/utils/pathValidator')

describe('PathValidator - Segurança contra Path Traversal', () => {
  const fixtureDir = path.join(__dirname, '../../fixtures/test-directory')
  const allowedPaths = [fixtureDir]

  describe('isValidPath - Validação Básica', () => {
    it('deve retornar false para string vazia', () => {
      expect(isValidPath('')).toBe(false)
    })

    it('deve retornar false para null ou undefined', () => {
      expect(isValidPath(null)).toBe(false)
      expect(isValidPath(undefined)).toBe(false)
    })

    it('deve retornar false para tipo não-string', () => {
      expect(isValidPath(123)).toBe(false)
      expect(isValidPath({})).toBe(false)
      expect(isValidPath([])).toBe(false)
    })

    it('deve retornar true para caminho válido sem whitelist', () => {
      expect(isValidPath(fixtureDir)).toBe(true)
    })

    it('deve retornar true para whitespace apenas after trim', () => {
      expect(isValidPath('   ')).toBe(false)
    })
  })

  describe('isValidPath - Path Traversal Prevention', () => {
    it('deve detectar tentativa de escape com ../', () => {
      const maliciousPath = path.join(fixtureDir, '..', '..', 'windows')
      expect(isValidPath(maliciousPath, allowedPaths)).toBe(false)
    })

    it('deve detectar tentativa de escape para /etc/passwd', () => {
      // Unix
      expect(isValidPath('../../../etc/passwd', allowedPaths)).toBe(false)
    })

    it('deve detectar tentativa de escape para C:\\Windows', () => {
      // Windows
      const maliciousPath = path.join(fixtureDir, '..', '..', 'Windows', 'System32')
      expect(isValidPath(maliciousPath, allowedPaths)).toBe(false)
    })

    it('deve bloquear path fora da whitelist', () => {
      const systemPath = 'C:\\Windows' || '/etc'
      expect(isValidPath(systemPath, allowedPaths)).toBe(false)
    })

    it('deve permitir path dentro da whitelist', () => {
      const validPath = path.join(fixtureDir, 'subfolder')
      expect(isValidPath(validPath, allowedPaths)).toBe(true)
    })

    it('deve permitir o próprio allowed path', () => {
      expect(isValidPath(fixtureDir, allowedPaths)).toBe(true)
    })

    it('deve bloquear path com múltiplos allowed paths quando fora de todos', () => {
      const multiAllowed = [fixtureDir, '/usr/local']
      const systemPath = 'C:\\Windows' || '/etc/passwd'
      expect(isValidPath(systemPath, multiAllowed)).toBe(false)
    })
  })

  describe('validatePathSecurity - Validação Completa', () => {
    it('deve retornar erro para path vazio', () => {
      const result = validatePathSecurity('')
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('INVALID_PATH')
    })

    it('deve retornar erro para path traversal', () => {
      const maliciousPath = path.join(fixtureDir, '..', '..', 'Windows')
      const result = validatePathSecurity(maliciousPath, allowedPaths)
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('FORBIDDEN_PATH')
    })

    it('deve retornar erro para path que não existe', () => {
      const nonExistentPath = path.join(fixtureDir, 'nonexistent-dir-12345')
      const result = validatePathSecurity(nonExistentPath, allowedPaths)
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('NOT_FOUND')
    })

    it('deve retornar erro para arquivo (não diretório)', () => {
      const filePath = __filename
      const result = validatePathSecurity(filePath)
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('NOT_A_DIRECTORY')
    })

    it('deve retornar sucesso para diretório válido', () => {
      const result = validatePathSecurity(fixtureDir, allowedPaths)
      expect(result.isValid).toBe(true)
      expect(result.error).toBeNull()
    })

    it('deve retornar erro para path fora da whitelist', () => {
      const systemPath = process.platform === 'win32' ? 'C:\\Windows' : '/etc'
      const result = validatePathSecurity(systemPath, allowedPaths)
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('FORBIDDEN_PATH')
    })
  })

  describe('Casos de Ataque Específicos', () => {
    it('deve bloquear double slash //', () => {
      const doublePath = fixtureDir + '//' + '..' + '//windows'
      expect(isValidPath(doublePath, allowedPaths)).toBe(false)
    })

    it('deve normalizar paths com . (current dir)', () => {
      const dotPath = path.join(fixtureDir, '.', 'subfolder')
      // Deve ser válido pois . é diretório atual
      expect(isValidPath(dotPath, allowedPaths)).toBe(true)
    })
  })
})
