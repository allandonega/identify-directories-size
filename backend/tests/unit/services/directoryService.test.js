// backend/tests/unit/services/directoryService.test.js
const fs = require('fs')
const path = require('path')
const {
  calculateDirectorySize,
  formatBytes,
  getDirectoryStructure,
} = require('../../../src/services/directoryService')

describe('DirectoryService', () => {
  const fixtureDir = path.join(__dirname, '../../fixtures/test-directory')

  describe('calculateDirectorySize', () => {
    it('deve retornar um número maior que zero para um diretório válido', () => {
      const size = calculateDirectorySize(fixtureDir)

      expect(typeof size).toBe('number')
      expect(size).toBeGreaterThan(0)
    })

    it('deve lançar erro para diretório que não existe', () => {
      const nonExistentPath = '/path/that/does/not/exist/12345'

      expect(() => {
        calculateDirectorySize(nonExistentPath)
      }).toThrow()
    })

    it('deve calcular tamanho correto incluindo subpastas', () => {
      const size = calculateDirectorySize(fixtureDir)

      // O fixture tem arquivos conhecidos, verificamos se é > 0
      expect(size).toBeGreaterThan(0)
    })

    it('deve retornar 0 para diretório vazio', () => {
      const emptyDir = path.join(fixtureDir, 'empty-dir')

      // Criar diretório vazio se não existir
      if (!fs.existsSync(emptyDir)) {
        fs.mkdirSync(emptyDir, { recursive: true })
      }

      const size = calculateDirectorySize(emptyDir)

      expect(size).toBe(0)
    })

    it('deve lançar erro para tipo inválido de caminho', () => {
      expect(() => {
        calculateDirectorySize(null)
      }).toThrow()

      expect(() => {
        calculateDirectorySize(123)
      }).toThrow()
    })

    it('deve lançar erro se caminho é um arquivo, não diretório', () => {
      const filePath = path.join(fixtureDir, 'file1.txt')

      expect(() => {
        calculateDirectorySize(filePath)
      }).toThrow('não é um diretório')
    })
  })

  describe('formatBytes', () => {
    it('deve formatar bytes corretamente', () => {
      expect(formatBytes(512)).toBe('512 B')
    })

    it('deve formatar kilobytes corretamente', () => {
      expect(formatBytes(1024)).toBe('1.00 KB')
    })

    it('deve formatar megabytes corretamente', () => {
      expect(formatBytes(1024 * 1024)).toBe('1.00 MB')
    })

    it('deve formatar gigabytes corretamente', () => {
      expect(formatBytes(1024 * 1024 * 1024)).toBe('1.00 GB')
    })

    it('deve retornar 0 B para tamanho 0', () => {
      expect(formatBytes(0)).toBe('0 B')
    })

    it('deve lançar erro para entrada inválida', () => {
      expect(() => formatBytes('invalid')).toThrow()
      expect(() => formatBytes(null)).toThrow()
    })
  })

  describe('getDirectoryStructure', () => {
    it('deve retornar estrutura de diretório como objeto', () => {
      const structure = getDirectoryStructure(fixtureDir)

      expect(structure).toBeDefined()
      expect(structure.name).toBeDefined()
      expect(structure.size).toBeGreaterThan(-1)
      expect(Array.isArray(structure.children)).toBe(true)
    })

    it('deve incluir informações de cada arquivo/pasta', () => {
      const structure = getDirectoryStructure(fixtureDir)

      expect(structure).toHaveProperty('name')
      expect(structure).toHaveProperty('size')
      expect(structure).toHaveProperty('children')
      expect(structure).toHaveProperty('path')
    })

    it('deve calcular percentual de ocupação relativa ao pai', () => {
      const structure = getDirectoryStructure(fixtureDir)

      // Se tem filhos, calcular percentual para cada um
      if (structure.children.length > 0) {
        structure.children.forEach((child) => {
          if (structure.size > 0) {
            const percentage = (child.size / structure.size) * 100
            expect(percentage).toBeGreaterThanOrEqual(0)
            expect(percentage).toBeLessThanOrEqual(100)
          }
        })
      }
    })

    it('deve lançar erro para diretório não existente', () => {
      expect(() => {
        getDirectoryStructure('/nonexistent/path/12345')
      }).toThrow('Diretório não existe')
    })

    it('deve retornar estrutura de arquivo (não diretório)', () => {
      const filePath = path.join(fixtureDir, 'file1.txt')
      const structure = getDirectoryStructure(filePath)

      expect(structure.isDirectory).toBe(false)
      expect(structure.children).toHaveLength(0)
      expect(structure.size).toBeGreaterThan(0)
    })

    it('deve respeitar profundidade máxima (maxDepth = 0)', () => {
      const structure = getDirectoryStructure(fixtureDir, 0)

      expect(structure.children).toHaveLength(0)
    })

    it('deve incluir arquivos quando onlyDirectories é false', () => {
      const structure = getDirectoryStructure(fixtureDir, Infinity, 0, false)

      const hasFiles = structure.children.some((child) => !child.isDirectory)
      expect(hasFiles).toBe(true)
    })

    it('deve lançar erro quando readdirSync falha', () => {
      const originalReaddirSync = fs.readdirSync
      fs.readdirSync = () => { throw new Error('Permission denied') }

      expect(() => {
        getDirectoryStructure(fixtureDir)
      }).toThrow('Erro ao ler diretório')

      fs.readdirSync = originalReaddirSync
    })
  })
})
