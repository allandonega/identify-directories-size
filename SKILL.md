# SKILL.md
## Skill: Desenvolvimento de Projeto Node.js com TDD

**Versão:** 1.0.0  
**Data de Criação:** 15/04/2026  
**Linguagem:** Português Brasileiro (PT-BR)  
**Status:** ✅ Completo e Funcional

---

## 📝 Visão Geral

Esta skill guia o desenvolvimento de uma **aplicação Node.js completa** chamada "Identify Directories Size" seguindo rigorosamente a metodologia **TDD (Test-Driven Development)**.

A skill inclui:
- ✅ Arquitetura clara e bem documentada
- ✅ Testes automatizados (80%+ cobertura)
- ✅ Frontend responsivo
- ✅ CI/CD com GitHub Actions
- ✅ Documentação em PT-BR
- ✅ Docker ready

---

## 🎯 Objetivo da Skill

Fornecer um **template pronto para produção** de uma aplicação Node.js com:
- Backend REST API (Express.js)
- Frontend web responsivo
- Testes automatizados (Jest)
- Documentação completa
- Pipeline CI/CD
- Boas práticas de desenvolvimento

---

## 📦 O que está Incluído

### Documentação
- **PRD.md** - Requisitos e especificações do produto
- **INSTRUCTIONS.md** - Padrões e regras obrigatórias do projeto
- **PROMPT.md** - Exemplos de prompts para usar com o agente
- **README.md** - Instruções de instalação e uso
- **SKILL.md** - Este arquivo (metadados da skill)

### Backend
- **Node.js + Express** - Framework web
- **Jest** - Framework de testes
- **35+ testes unitários e de integração**
- **80%+ cobertura de código**
- API REST com validação e tratamento de erros

### Frontend
- **HTML5 + CSS3 + JavaScript vanilla**
- **Interface responsiva** (desktop, tablet, mobile)
- **Integração com API backend**
- **Experiência de usuário intuitiva**

### DevOps
- **GitHub Actions** - CI/CD automático
- **Docker** - Containerização
- **Docker Compose** - Orquestração local

---

## 🚀 Como Usar Esta Skill

### 1. **Novo Projeto Node.js**
Se você quer criar um novo projeto Node.js com TDD:

```bash
# Clone ou use como template
git clone <repo-url>
cd identify-directories-size

# Instale dependências
npm install
cd backend && npm install && cd ..

# Inicie desenvolvimento
npm run dev
```

### 2. **Estudar Padrões**
Para entender os padrões usados:

1. Leia [INSTRUCTIONS.md](INSTRUCTIONS.md) - Padrões de código
2. Veja [PRD.md](PRD.md) - Estrutura de requisitos
3. Estude os testes em `backend/tests/`
4. Analise o código em `backend/src/`

### 3. **Adicionar Features**
Para adicionar novas funcionalidades:

1. Escreva testes primeiro (TDD)
2. Implemente o código
3. Atualize documentação
4. Faça commit com mensagem clara

Veja [PROMPT.md](PROMPT.md) para exemplos de prompts.

---

## 📊 Estatísticas do Projeto

| Métrica | Valor |
|---------|-------|
| Testes | 35 passando ✅ |
| Cobertura | 80% |
| Linhas de Código (Backend) | ~500 |
| Linhas de Código (Frontend) | ~400 |
| Documentação | ~2000 |
| Commits | ~4 |
| Tempo de Desenvolvimento | ~2-3 horas |

---

## 🔑 Princípios Fundamentais

### 1. TDD é Obrigatório
- Sempre escreva testes ANTES de implementar
- Red → Green → Refactor
- Mínimo 80% de cobertura

### 2. Qualidade de Código
- Padrões JavaScript ES6+
- Sem `console.log` em produção
- Nomeação clara e consistente

### 3. Documentação Viva
- Documentação sempre atualizada
- Código autodocumentado com comentários
- Exemplos práticos nos README

### 4. Execução Sequencial
- Tarefas uma por vez (sem paralelismo)
- Progresso rastreável
- Pontos de pausa bem definidos

---

## 🛠️ Tecnologias Usadas

### Backend
- Node.js 18+ LTS
- Express.js 4.x
- Jest (testes)
- Supertest (testes de integração)

### Frontend
- HTML5
- CSS3 (sem frameworks)
- JavaScript vanilla (ES6+)
- localStorage para persistência

### DevOps
- GitHub Actions
- Docker
- Docker Compose
- Git

---

## 📈 Próximas Melhorias (Roadmap)

- [ ] Deploy automático (Heroku/Railway/Vercel)
- [ ] Autenticação de usuários
- [ ] Cache de resultados (Redis)
- [ ] Suporte a múltiplos idiomas
- [ ] Dashboard de métricas
- [ ] Monitoramento e logging (Winston)
- [ ] Rate limiting
- [ ] Documentação OpenAPI/Swagger

---

## 👥 Contribuindo

Para adicionar features ou corrigir bugs:

1. Siga [INSTRUCTIONS.md](INSTRUCTIONS.md)
2. Use padrão de commit convencional
3. Escreva testes (TDD)
4. Atualize documentação

---

## 📞 Suporte

Dúvidas sobre a skill? Consulte:

- [INSTRUCTIONS.md](INSTRUCTIONS.md) - Padrões e regras
- [PROMPT.md](PROMPT.md) - Exemplos de prompts
- [PRD.md](PRD.md) - Requisitos do projeto
- [README.md](README.md) - Como usar

---

## 📄 Licença

MIT License - Use livremente em seus projetos!

---

## 🎓 Aprendizados

Esta skill demonstra:
- ✅ TDD completo (Red-Green-Refactor)
- ✅ Estrutura clara de projeto
- ✅ Testes em diferentes níveis (unit, integration)
- ✅ API REST bem designada
- ✅ Frontend responsivo
- ✅ CI/CD funcionando
- ✅ Documentação profissional

---

**Desenvolvido com ❤️ para demonstrar as melhores práticas em desenvolvimento Node.js.**

**Última atualização:** 15/04/2026  
**Versão:** 1.0.0  
**Autor:** Allan Donegá
