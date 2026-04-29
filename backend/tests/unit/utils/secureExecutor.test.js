/**
 * Testes de segurança para Command Injection
 * TDD: Testes primeiro, implementação depois
 */

const path = require('path')
const { safeOpenDirectory } = require('../../../src/utils/secureExecutor')

describe('SecureExecutor - Proteção contra Command Injection', () => {
  const fixtureDir = path.join(__dirname, '../../fixtures/test-directory')

  describe('safeOpenDirectory - Validação de Comando', () => {
    it('deve rejeitar path com aspas duplas', async () => {
      const maliciousPath = 'C:\\test"&whoami&"'
      await expect(safeOpenDirectory(maliciousPath)).rejects.toThrow()
    })

    it('deve rejeitar path com & (command separator)', async () => {
      const maliciousPath = 'C:\\test&whoami&'
      await expect(safeOpenDirectory(maliciousPath)).rejects.toThrow()
    })

    it('deve rejeitar path com | (pipe)', async () => {
      const maliciousPath = 'C:\\test | whoami'
      await expect(safeOpenDirectory(maliciousPath)).rejects.toThrow()
    })

    it('deve rejeitar path com ; (command terminator)', async () => {
      const maliciousPath = 'C:\\test; whoami'
      await expect(safeOpenDirectory(maliciousPath)).rejects.toThrow()
    })

    it('deve rejeitar path com backtick (command substitution)', async () => {
      const maliciousPath = 'C:\\test`whoami`'
      await expect(safeOpenDirectory(maliciousPath)).rejects.toThrow()
    })

    it('deve rejeitar path com $(command) (bash substitution)', async () => {
      const maliciousPath = '/tmp/test$(whoami)'
      await expect(safeOpenDirectory(maliciousPath)).rejects.toThrow()
    })

    it('deve aceitar caminho válido sem caracteres maliciosos', async () => {
      // Este teste é mais de validação - não vamos executar realmente
      await expect(
        safeOpenDirectory(fixtureDir, true) // dry-run mode
      ).resolves.not.toThrow()
    })

    it('deve escapar corretamente path com espaços', async () => {
      const pathWithSpaces = path.join(fixtureDir, 'folder with spaces')
      // Deve aceitar caminhos com espaços legítimos (dry-run porque não existe)
      // Esperamos erro de NOT_FOUND, não de injection
      try {
        await safeOpenDirectory(pathWithSpaces, false)
      } catch (error) {
        expect(error.code).not.toBe('INJECTION_DETECTED')
      }
    })

    it('deve rejeitar path vazio ou null', async () => {
      await expect(safeOpenDirectory('')).rejects.toThrow()
      await expect(safeOpenDirectory(null)).rejects.toThrow()
    })
  })

  describe('safeOpenDirectory - Detecção de Caracteres Perigosos', () => {
    const dangerousChars = [
      { char: '&', desc: 'ampersand (command separator)' },
      { char: '|', desc: 'pipe (output redirection)' },
      { char: ';', desc: 'semicolon (command terminator)' },
      { char: '`', desc: 'backtick (command substitution)' },
      { char: '$', desc: 'dollar (variable/command substitution)' },
      { char: '(', desc: 'parenthesis (subshell)' },
      { char: ')', desc: 'parenthesis (subshell)' },
      { char: '<', desc: 'input redirection' },
      { char: '>', desc: 'output redirection' },
    ]

    dangerousChars.forEach(({ char, desc }) => {
      it(`deve bloquear caractere "${char}" (${desc})`, async () => {
        const maliciousPath = `/tmp/test${char}whoami`
        await expect(safeOpenDirectory(maliciousPath)).rejects.toThrow()
      })
    })
  })

  describe('safeOpenDirectory - Cross-Platform Safety', () => {
    it('deve suportar Windows paths de forma segura', async () => {
      const winPath = path.join(fixtureDir, 'subfolder')
      try {
        await safeOpenDirectory(winPath, true) // dry-run
      } catch (error) {
        expect(error.code).not.toBe('INJECTION_DETECTED')
      }
    })

    it('deve suportar Unix paths de forma segura', async () => {
      const unixPath = '/tmp/test/directory'
      try {
        await safeOpenDirectory(unixPath, true) // dry-run
      } catch (error) {
        expect(error.message).not.toMatch(/injection/i)
      }
    })

    it('deve suportar macOS paths de forma segura', async () => {
      const macPath = '/Users/test/directory'
      try {
        await safeOpenDirectory(macPath, true) // dry-run
      } catch (error) {
        expect(error.message).not.toMatch(/injection/i)
      }
    })
  })

  describe('safeOpenDirectory - Logging de Segurança', () => {
    it('deve registrar tentativas de command injection', async () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation()
      const maliciousPath = 'C:\\test&whoami&'

      try {
        await safeOpenDirectory(maliciousPath)
      } catch (error) {
        // Esperado
      }

      expect(consoleWarnSpy).toHaveBeenCalled()
      consoleWarnSpy.mockRestore()
    })
  })
})
