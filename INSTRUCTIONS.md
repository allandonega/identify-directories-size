# INSTRUCTIONS.md
## Skill de Desenvolvimento - Identify Directories Size

**Versão:** 1.0.0  
**Linguagem:** Português Brasileiro (PT-BR)  
**Criado:** 15/04/2026  
**Propósito:** Guiar o agente (e desenvolvedores) nas práticas e padrões deste projeto

---

## 🎯 Princípios Fundamentais

Este documento define as instruções obrigatórias para qualquer trabalho realizado neste projeto. **SEMPRE** siga estas regras, mesmo que o usuário solicite o contrário.

### 1. TDD é Obrigatório
- **Sempre** escreva testes ANTES de implementar a funcionalidade
- Estrutura: Red → Green → Refactor
- Cobertura mínima: 80%
- Use Jest como framework de testes
- Padrão: `*.test.js` ou `*.spec.js`

### 2. Execução Sequencial, Não Paralela
- Tarefas devem ser executadas uma por vez
- Use `manage_todo_list` para rastrear progresso
- Marque tarefas como "in-progress" antes de começar
- Marque como "completed" IMEDIATAMENTE após terminar
- Nunca execute operações paralelas no terminal (use `&&` em sequência)

### 3. Atualizar Arquivos .md Continuamente
- **README.md**: Instruções de instalação, uso e contribuição
- **PRD.md**: Requisitos do projeto (já criado, atualizar conforme necessário)
- **INSTRUCTIONS.md**: Este arquivo (atualizar com novas regras descobertas)
- **PROMPT.md**: Exemplos de prompts para usar com o agente
- **SKILL.md**: Resumo da skill e metadados
- Sempre manter sincronizado com código/mudanças

### 4. Estrutura de Pastas Obrigatória
```
identify-directories-size/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   └── index.js
│   ├── tests/
│   │   ├── unit/
│   │   ├── integration/
│   │   └── fixtures/
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── public/
│   │   ├── index.html
│   │   ├── styles.css
│   │   └── assets/
│   ├── src/
│   │   ├── app.js
│   │   └── utils.js
│   └── tests/
├── .github/
│   └── workflows/
│       └── ci.yml
├── PRD.md
├── README.md
├── INSTRUCTIONS.md
├── PROMPT.md
├── SKILL.md
├── .gitignore
└── package.json (root)
```

### 5. Padrões de Código

#### 5.1 JavaScript/Node.js
- **Estilo**: ES6+, sem semicolons (Prettier com `--no-semi`)
- **Nomeação**:
  - Variáveis/funções: `camelCase`
  - Classes: `PascalCase`
  - Constantes: `UPPER_SNAKE_CASE`
  - Arquivos: `kebab-case.js`
- **Estrutura**:
  ```javascript
  // Imports
  const express = require('express')
  const { someFunction } = require('./utils')
  
  // Config
  const router = express.Router()
  
  // Middleware/Handlers
  const handleRequest = (req, res) => {
    // implementação
  }
  
  // Exports
  module.exports = { handleRequest }
  ```

#### 5.2 Testes (Jest)
- **Padrão AAA**: Arrange, Act, Assert
- **Nomes descritivos**: `it('deve retornar tamanho em bytes')`
- **Cobertura**: Unit tests + Integration tests
- **Fixtures**: Dados de teste em `tests/fixtures/`
- Exemplo:
  ```javascript
  describe('calculateDirectorySize', () => {
    it('deve retornar tamanho total de um diretório', () => {
      // Arrange
      const testDir = './fixtures/test-directory'
      
      // Act
      const result = calculateDirectorySize(testDir)
      
      // Assert
      expect(result).toBeGreaterThan(0)
      expect(typeof result).toBe('number')
    })
  })
  ```

#### 5.3 API REST
- **Rotas**: `/api/v1/...`
- **Métodos**: GET (leitura), POST (análise), DELETE (cache)
- **Respostas**:
  ```javascript
  {
    success: true,
    data: { ... },
    message: "Operação concluída com sucesso",
    timestamp: "2026-04-15T10:30:00Z"
  }
  ```
- **Erros**:
  ```javascript
  {
    success: false,
    error: "INVALID_PATH",
    message: "O caminho fornecido não é válido",
    statusCode: 400
  }
  ```

### 6. Convenções de Commits Git

Use conventional commits:
```
feat: adicionar cálculo de tamanho recursivo
fix: corrigir permissões de acesso ao diretório
test: adicionar testes para calculateSize
docs: atualizar README com exemplos
chore: atualizar dependências
refactor: reorganizar lógica de cálculo
```

### 7. Tratamento de Dúvidas

Se houver incerteza:
1. **PAUSAR** a execução
2. Fazer perguntas claras usando `vscode_askQuestions`
3. Aguardar resposta do usuário
4. Prosseguir com clareza

**NUNCA** prosseguir com suposições.

### 8. Variáveis de Ambiente

Arquivo `.env.example`:
```
NODE_ENV=development
PORT=3000
LOG_LEVEL=info
MAX_DIRECTORY_SIZE_BYTES=1099511627776
ALLOWED_PATHS=/home,/usr,C:\Users
```

### 9. Logging e Erros

- Use `console.log()` em desenvolvimento
- Para produção: considerar Winston ou similar
- Logs devem incluir timestamp, nível (INFO, ERROR, WARN), mensagem
- Erros devem ser capturados e tratados

### 10. Performance e Otimização

- Operações de I/O devem ser assíncronas (async/await)
- Cache de resultados (considerar Redis no futuro)
- Processar diretórios grandes em chunks
- Feedback de progresso ao usuário

---

## 📋 Checklist para Cada Tarefa

Antes de considerar uma tarefa como "completed":

- [ ] Testes criados e passando (TDD)
- [ ] Código funcional e testado
- [ ] Sem erros de linting (prettier/eslint)
- [ ] Documentação (.md) atualizada
- [ ] Commit git realizado com mensagem clara
- [ ] Integração com tarefas anteriores verificada

---

## 🚀 Padrão de Desenvolvimento

### Fluxo para Implementar uma Feature:

1. **Criar teste** (Red)
   ```bash
   npm test -- --watch
   ```

2. **Implementar mínimo** para passar (Green)
   - Código funcional, não precisa ser perfeito

3. **Refatorar** (Refactor)
   - Melhorar qualidade, remover duplicação

4. **Atualizar .md**
   - README, INSTRUCTIONS, PRD se necessário

5. **Fazer commit**
   ```bash
   git add .
   git commit -m "feat: descrição clara"
   ```

---

## 📚 Recursos Importantes

- **Jest Docs**: https://jestjs.io/docs/getting-started
- **Express Docs**: https://expressjs.com/
- **Node.js Async**: https://nodejs.org/en/docs/guides/blocking-vs-non-blocking/

---

## 🔄 Revisão e Atualização

Este documento deve ser atualizado quando:
- Nova prática ou padrão for descoberto
- Erro de implementação recorrente for identificado
- Stack tecnológico mudar
- Requisitos forem ajustados

**Última atualização:** 15/04/2026  
**Atualizado por:** Allan Donegá
