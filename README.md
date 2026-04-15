# Identify Directories Size

[![CI/CD](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-blue)](https://github.com)
[![Coverage](https://img.shields.io/badge/coverage-80%25-green)]()
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18.0.0-green)](https://nodejs.org/)

Uma aplicação **NodeJS** que calcula e exibe o tamanho de diretórios e subpastas através de uma interface web intuitiva.

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Funcionalidades](#funcionalidades)
- [Instalação](#instalação)
- [Uso](#uso)
- [Desenvolvimento](#desenvolvimento)
- [Testes](#testes)
- [Contribuição](#contribuição)

---

## 🎯 Visão Geral

Esta aplicação resolve o problema de identificar rapidamente quais diretórios e subpastas ocupam mais espaço em disco. Útil para:

- 📊 Analisar distribuição de armazenamento
- 🧹 Limpeza e otimização de disco
- 📈 Monitoramento de crescimento de pastas
- 🚀 Melhor uso de espaço disponível

**Stack Tecnológico:**
- **Backend**: Node.js + Express
- **Frontend**: HTML5 + CSS3 + JavaScript
- **Testes**: Jest + TDD
- **CI/CD**: GitHub Actions

---

## ✨ Funcionalidades

- ✅ Análise de diretórios em tempo real
- ✅ Exibição hierárquica de pastas
- ✅ Botão para abrir pastas no explorador (Windows, macOS, Linux)
- ✅ Formatação automática de tamanhos (B, KB, MB, GB)
- ✅ Interface web responsiva
- ✅ Tratamento robusto de erros
- ✅ Testes automatizados (80%+ cobertura)

---

## 🚀 Instalação

### Pré-requisitos
- Node.js v18+
- npm ou yarn
- Git

### Passos

1. **Clonar o repositório**
   ```bash
   git clone <seu-repo>
   cd identify-directories-size
   ```

2. **Instalar dependências**
   ```bash
   npm install
   cd backend && npm install && cd ..
   ```

3. **Configurar variáveis de ambiente (opcional)**
   ```bash
   cp backend/.env.example backend/.env
   ```

4. **Iniciar o servidor em desenvolvimento**
   ```bash
   npm run dev
   ```

5. **Acessar a aplicação**
   ```
   http://localhost:3000
   ```

### Usando Docker

```bash
# Build
docker build -t identify-directories-size .

# Run
docker run -p 3000:3000 identify-directories-size

# Ou com Docker Compose
docker-compose up
```

---

## 📖 Uso

### Interface Web

1. Abra `http://localhost:3000` no navegador
2. Insira o caminho do diretório desejado
3. Clique em "Analisar"
4. Visualize a hierarquia de tamanhos
5. Clique em "Abrir" para explorar pastas

### Exemplos

**Linux/macOS:**
```
/home/usuario/projetos
/usr/local
```

**Windows:**
```
C:\Users\usuario\Documents
C:\Program Files
```

---

## 🛠️ Desenvolvimento

### Estrutura do Projeto

```
identify-directories-size/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Lógica de requisição HTTP
│   │   ├── services/        # Lógica de negócio
│   │   ├── routes/          # Definição de rotas
│   │   ├── middleware/      # Middlewares Express
│   │   └── index.js         # Entrada principal
│   └── tests/
│       ├── unit/            # Testes unitários
│       ├── integration/      # Testes de integração
│       └── fixtures/        # Dados de teste
├── frontend/
│   ├── public/
│   │   ├── index.html       # HTML principal
│   │   ├── styles.css       # Estilos
│   │   └── assets/
│   └── src/
│       ├── app.js           # Lógica da app
│       └── utils.js         # Utilitários
└── tests/                   # Testes do frontend
```

### Padrões de Código

- **Linguagem**: JavaScript ES6+
- **Estilo**: Prettier (sem semicolons)
- **Metodologia**: TDD (Red → Green → Refactor)
- **Commits**: Conventional Commits

---

## 🧪 Testes

### Executar Testes

```bash
# Todos os testes com cobertura
npm test

# Watch mode (desenvolvimento)
npm run test:watch

# Apenas testes unitários
npm run test:unit

# Apenas testes de integração
npm run test:integration
```

### Cobertura Mínima

- **Branches**: 80%
- **Functions**: 80%
- **Lines**: 80%
- **Statements**: 80%

### Exemplo de Teste (TDD)

```javascript
// tests/unit/services/directoryService.test.js
describe('DirectoryService', () => {
  it('deve retornar tamanho total de um diretório', () => {
    // Arrange
    const testPath = './tests/fixtures/test-dir'
    
    // Act
    const size = calculateDirectorySize(testPath)
    
    // Assert
    expect(size).toBeGreaterThan(0)
  })
})
```

---

## 🚀 CI/CD

A aplicação usa **GitHub Actions** para:
- ✅ Rodar testes automaticamente
- ✅ Verificar cobertura mínima
- ✅ Validar código (ESLint)
- ✅ Deploy automático (quando aplicável)

Ver [`.github/workflows/ci.yml`](.github/workflows/ci.yml)

---

## 📝 Contribuição

### Ao Contribuir, Lembre-se:

1. **TDD é Obrigatório** - Escreva testes antes do código
2. **Follow INSTRUCTIONS.md** - Respeite padrões do projeto
3. **Mensagens de Commit Claras** - Use Conventional Commits
4. **Atualize Documentação** - README, PRD, INSTRUCTIONS

### Passo a Passo

1. Crie uma branch: `git checkout -b feat/sua-feature`
2. Escreva testes para a feature
3. Implemente a feature
4. Ensure tests pass: `npm test`
5. Faça commit: `git commit -m "feat: descrição clara"`
6. Abra um Pull Request

---

## 📚 Documentação

- [PRD.md](PRD.md) - Requisitos do Projeto
- [INSTRUCTIONS.md](INSTRUCTIONS.md) - Regras e Padrões
- [PROMPT.md](PROMPT.md) - Exemplos de Prompts para o Agente *(em criação)*
- [SKILL.md](SKILL.md) - Metadados da Skill *(em criação)*

---

## 📄 Licença

MIT License - veja [LICENSE](LICENSE) para detalhes

---

## ✉️ Contato

**Autor**: Allan Donegá  
**Email**: allan.s.donega@gmail.com  
**Criado**: 15/04/2026

---

## 🔄 Status do Projeto

| Componente | Status | Progresso | Testes |
|-----------|--------|-----------|--------|
| Setup & Docs | ✅ Completo | 100% | - |
| Backend (API) | ✅ Completo | 100% | 35 testes ✅ 80% cobertura |
| Frontend (UI) | ✅ Completo | 100% | - |
| CI/CD | ✅ Completo | 100% | GitHub Actions |
| Docker | ✅ Completo | 100% | Dockerfile + docker-compose |
| Deploy | 📋 Planejado | 0% | - |

---

**Última atualização:** 15/04/2026
