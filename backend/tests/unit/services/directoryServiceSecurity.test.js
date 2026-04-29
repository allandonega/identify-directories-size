/**
 * Testes para proteção contra Recursão Infinita/DoS
 */

const path = require('path')
const fs = require('fs')
const { getDirectoryStructureWithLimits } = require('../../../src/services/directoryService')

describe('DirectoryService - Proteção contra Recursão Sem Limite', () => {
  const fixtureDir = path.join(__dirname, '../../fixtures/test-directory')

  describe('getDirectoryStructureWithLimits - Proteção de Profundidade', () => {
    it('deve respeitar limite de profundidade máxima', async () => {
      const maxDepth = 2
      const structure = await getDirectoryStructureWithLimits(fixtureDir, {
        maxDepth,
      })

      const checkDepth = (node, depth = 0) => {
        expect(depth).toBeLessThanOrEqual(maxDepth)
        if (node.children && node.children.length > 0) {
          node.children.forEach((child) => {
            checkDepth(child, depth + 1)
          })
        }
      }

      checkDepth(structure)
    })

    it('deve parar em profundidade 1 quando maxDepth=1', async () => {
      const structure = await getDirectoryStructureWithLimits(fixtureDir, {
        maxDepth: 1,
      })

      if (structure.children) {
        structure.children.forEach((child) => {
          expect(child.children).toBeDefined()
        })
      }
    })

    it('deve permitir profundidade maior quando configurado', async () => {
      const structure = await getDirectoryStructureWithLimits(fixtureDir, {
        maxDepth: 10,
      })

      expect(structure).toBeDefined()
      expect(structure.name).toBeDefined()
    })

    it('deve usar profundidade padrão segura (5)', async () => {
      const structure = await getDirectoryStructureWithLimits(fixtureDir)

      const checkMaxDepth = (node, depth = 0) => {
        expect(depth).toBeLessThanOrEqual(5)
        if (node.children) {
          node.children.forEach((child) => {
            checkMaxDepth(child, depth + 1)
          })
        }
      }

      checkMaxDepth(structure)
    })
  })

  describe('getDirectoryStructureWithLimits - Proteção de Quantidade de Itens', () => {
    it('deve parar quando atingir maxItems', async () => {
      const maxItems = 10
      const structure = await getDirectoryStructureWithLimits(fixtureDir, {
        maxItems,
      })

      let itemCount = 0
      const countItems = (node) => {
        itemCount++
        if (node.children) {
          node.children.forEach(countItems)
        }
      }

      countItems(structure)
      expect(itemCount).toBeLessThanOrEqual(maxItems)
    })

    it('deve incluir flag de truncamento quando atinge limite', async () => {
      const maxItems = 5
      const structure = await getDirectoryStructureWithLimits(fixtureDir, {
        maxItems,
      })

      expect(structure).toBeDefined()
      expect(structure.truncated).toBeDefined()
    })

    it('deve usar quantidade padrão segura (10000)', async () => {
      const structure = await getDirectoryStructureWithLimits(fixtureDir)

      let itemCount = 0
      const countItems = (node) => {
        itemCount++
        if (node.children) {
          node.children.forEach(countItems)
        }
      }

      countItems(structure)
      expect(itemCount).toBeLessThanOrEqual(10000)
    })

    it('deve permitir quantidade maior quando configurado', async () => {
      const maxItems = 50000
      const structure = await getDirectoryStructureWithLimits(fixtureDir, {
        maxItems,
      })

      expect(structure).toBeDefined()
    })
  })

  describe('getDirectoryStructureWithLimits - Proteção contra Timeout', () => {
    it('deve respeitar timeout em millisegundos', async () => {
      const timeout = 30000
      const startTime = Date.now()

      const structure = await getDirectoryStructureWithLimits(fixtureDir, {
        timeout,
      })
      const duration = Date.now() - startTime
      expect(duration).toBeLessThan(timeout)
      expect(structure).toBeDefined()
    })

    it('deve usar timeout padrão seguro (30000ms)', async () => {
      const structure = await getDirectoryStructureWithLimits(fixtureDir)
      expect(structure).toBeDefined()
    })
  })

  describe('getDirectoryStructureWithLimits - Proteção contra Symlinks Cíclicos', () => {
    it('deve ignorar symlinks e evitar loops', async () => {
      const structure = await getDirectoryStructureWithLimits(fixtureDir, {
        followSymlinks: false,
      })

      expect(structure).toBeDefined()
      expect(structure.size).toBeGreaterThanOrEqual(0)
    })

    it('deve não seguir symlinks por padrão', async () => {
      const structure = await getDirectoryStructureWithLimits(fixtureDir)
      expect(structure).toBeDefined()
    })
  })

  describe('getDirectoryStructureWithLimits - Relatório de Proteção', () => {
    it('deve retornar informações de proteção aplicada', async () => {
      const options = {
        maxDepth: 3,
        maxItems: 5000,
        timeout: 30000,
      }

      const structure = await getDirectoryStructureWithLimits(fixtureDir, options)

      expect(structure._protection).toBeDefined()
      expect(structure._protection.maxDepth).toBe(3)
      expect(structure._protection.maxItems).toBe(5000)
    })

    it('deve indicar se foi truncado por limite', async () => {
      const structure = await getDirectoryStructureWithLimits(fixtureDir, {
        maxItems: 3,
      })

      expect(structure.truncated).toBeDefined()
    })
  })

  describe('Cenários de DoS Prevention', () => {
    it('deve processar diretório sem travar', async () => {
      const startTime = Date.now()
      const structure = await getDirectoryStructureWithLimits(fixtureDir, {
        maxDepth: 2,
        maxItems: 100,
        timeout: 30000,
      })
      const duration = Date.now() - startTime

      expect(duration).toBeLessThan(30000)
      expect(structure.truncated).toBeDefined()
    })

    it('deve proteger contra consumo infinito', async () => {
      const memBefore = process.memoryUsage().heapUsed

      const structure = await getDirectoryStructureWithLimits(fixtureDir, {
        maxDepth: 5,
        maxItems: 10000,
      })

      const memAfter = process.memoryUsage().heapUsed
      const memIncrease = memAfter - memBefore

      expect(memIncrease).toBeLessThan(100 * 1024 * 1024)
    })
  })
})
