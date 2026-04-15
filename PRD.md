# PRD - Product Requirements Document
## Identify Directories Size

**Versão:** 1.0.0  
**Data:** 15 de Abril de 2026  
**Status:** Em Desenvolvimento

---

## 1. Visão Geral

Uma aplicação NodeJS que calcula e exibe o tamanho de diretórios e subpastas, permitindo ao usuário visualizar a distribuição de espaço em disco de forma intuitiva através de uma interface web.

---

## 2. Objetivo Principal

Fornecer uma ferramenta visual para identificar rapidamente quais diretórios e subpastas ocupam mais espaço em disco, facilitando a limpeza e otimização de armazenamento.

---

## 3. Funcionalidades

### 3.1 Requisitos Funcionais

#### RF1 - Análise de Diretório
- **Descrição**: Sistema deve receber um caminho de diretório e calcular o tamanho total e de cada subpasta
- **Aceitação**: 
  - Retorna tamanho em bytes, KB, MB, GB (formatado)
  - Funciona com caminhos absolutos e relativos
  - Trata erros (diretório não existe, permissões insuficientes)

#### RF2 - Exibição Hierárquica
- **Descrição**: Interface mostra a hierarquia de pastas com seus respectivos tamanhos
- **Aceitação**:
  - Exibe em formato de árvore ou lista expandível
  - Mostra percentual de ocupação relativo ao total
  - Ordenação por tamanho (maior primeiro)

#### RF3 - Botão de Abertura
- **Descrição**: Cada pasta tem um botão para abrir no explorador do sistema
- **Aceitação**:
  - Funciona em Windows (Explorer), macOS (Finder), Linux (Nautilus)
  - Abre apenas pastas que existem no sistema
  - Feedback visual quando clicado

#### RF4 - Interface Web
- **Descrição**: Interface acessível via navegador (localhost)
- **Aceitação**:
  - Responsiva em desktop e tablet
  - Carregamento visual enquanto processa
  - Suporte a modo escuro (opcional)

### 3.2 Requisitos Não-Funcionais

#### RNF1 - Performance
- Deve processar diretórios com até 10.000 arquivos em menos de 5 segundos
- Interface responsiva com feedback em tempo real

#### RNF2 - Confiabilidade
- Testes com cobertura mínima de 80%
- Tratamento de erros robusto

#### RNF3 - Usabilidade
- Interface intuitiva sem necessidade de documentação
- Mensagens de erro claras em PT-BR

---

## 4. Stack Tecnológico

### Backend
- **Runtime**: Node.js (v18+)
- **Framework**: Express.js (simples e leve)
- **Testes**: Jest + Supertest
- **Padrão**: TDD (Test-Driven Development)

### Frontend
- **Tecnologia**: HTML5 + CSS3 + JavaScript (Vanilla)
- **Build**: Webpack (opcional) ou sem build se simples
- **UI**: Limpa e minimalista

### DevOps
- **Versionamento**: Git + GitHub
- **CI/CD**: GitHub Actions
- **Deployable**: Pronto para Docker (opcional)

---

## 5. User Stories

### US1 - Analisar Tamanho de Diretório
```
Como um usuário
Quero fornecer um caminho de diretório
Para que eu veja o tamanho total e de cada subpasta
```

**Critérios de Aceitação:**
- Caixa de entrada para caminho do diretório
- Botão "Analisar" ou upload automático
- Exibe resultado em menos de 5 segundos
- Mostra tamanho formatado (B, KB, MB, GB)

### US2 - Explorar Hierarquia de Pastas
```
Como um usuário
Quero ver as pastas organizadas hierarquicamente
Para entender a estrutura de ocupação de espaço
```

**Critérios de Aceitação:**
- Exibe árvore expansível
- Mostra % de ocupação
- Pastas maiores em destaque
- Ordenação customizável

### US3 - Abrir Pasta no Sistema
```
Como um usuário
Quero clicar em um botão para abrir a pasta
Para acessar rapidamente os arquivos
```

**Critérios de Aceitação:**
- Botão de ícone "pasta" ou "abrir"
- Abre no explorador/finder do SO
- Funciona em Windows, macOS, Linux
- Feedback visual

---

## 6. Critérios de Entrega

- [x] Repositório Git criado
- [ ] PRD completo e refinado
- [ ] INSTRUCTIONS.md para o agente
- [ ] Estrutura de pastas configurada
- [ ] Testes unitários (TDD)
- [ ] API Node.js funcional
- [ ] Frontend responsivo
- [ ] CI/CD configurado
- [ ] README.md atualizado
- [ ] Deploy testado

---

## 7. Timeline (Estimada)

| Fase | Duração | Status |
|------|---------|--------|
| Setup + PRD | 1-2h | Em andamento |
| Testes + API | 3-4h | Planejado |
| Frontend | 2-3h | Planejado |
| CI/CD | 1-2h | Planejado |
| Refinamento | 1h | Planejado |

---

## 8. Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|--------|-----------|
| Performance com diretórios grandes | Médio | Alto | Implementar cache e processamento assíncrono |
| Compatibilidade entre SOs | Médio | Médio | Testar em Windows, macOS, Linux |
| Segurança (acesso a dirs restritos) | Baixo | Alto | Validar caminhos e tratar permissões |

---

## 9. Próximos Passos

1. Revisar e validar este PRD
2. Criar INSTRUCTIONS.md para o agente
3. Inicializar projeto Node.js com TDD
4. Implementar testes automatizados
5. Desenvolver API e Frontend
6. Configurar pipeline CI/CD

---

**Aprovado por:** Allan Donegá  
**Data de Aprovação:** 15/04/2026
