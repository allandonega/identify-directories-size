# PROMPT.md
## Exemplos de Prompts para o Agente

**Versão:** 1.0.0  
**Criado:** 15/04/2026  
**Propósito:** Fornecer exemplos de prompts efetivos para trabalhar com o agente (Copilot) neste projeto.

---

## 🎯 Prompts para Desenvolvimento

### Feature Development

```
Criar uma nova feature para [descrição breve].
Seguir TDD: 
1. Escrever testes primeiro (em backend/tests/unit/)
2. Implementar código para passar nos testes
3. Refatorar se necessário
4. Fazer commit com mensagem descritiva
Lembrar de atualizar README.md se necessário.
```

### Exemplo Prático

```
Adicionar suporte a formatação de tempo (mostrar "last modified" dos arquivos).
Passos:
1. Criar testes em backend/tests/unit/services/
2. Implementar em backend/src/services/
3. Adicionar resposta JSON no controller
4. Atualizar frontend para exibir informação
5. Commit: "feat: adicionar informação de last modified"
Ter cobertura de testes mínima 80%.
```

---

## 🐛 Prompts para Debugging

```
Estou recebendo [erro específico] ao [ação].
Stacktrace:
[colar erro aqui]

Seguir INSTRUCTIONS.md ao investigar.
```

### Exemplo

```
Erro "Cannot read property 'map' of undefined" ao analisar diretório vazio.
Verificar:
1. Resposta da API em casos de diretório vazio
2. Tratamento de null/undefined no frontend
3. Adicionar teste para este caso
Seguir TDD: teste primeiro, depois correção.
```

---

## 📚 Prompts para Documentação

```
Atualizar [documento] com:
- [mudança 1]
- [mudança 2]

Manter estilo e estrutura existente.
Manter em Português Brasileiro.
```

### Exemplo

```
Atualizar PRD.md:
- Adicionar nova feature de cache
- Atualizar timeline de entrega
- Atualizar riscos identificados

Manter formatação markdown existente.
```

---

## 🔍 Prompts para Code Review

```
Revisar este código para:
1. Conformidade com INSTRUCTIONS.md
2. Qualidade e padrões de código
3. Cobertura de testes adequada
4. Segurança

[Colar código ou arquivo]
```

### Exemplo

```
Revisar backend/src/controllers/directoryController.js:
- Segue padrões do projeto?
- Validações adequadas?
- Testes suficientes?
- Tratamento de erros completo?
```

---

## 🚀 Prompts para Performance

```
Otimizar [componente] que está lento ao [situação].
Requisitos:
- Manter testes passando (80%+ cobertura)
- Benchmark antes/depois
- Documentar mudanças

Seguir INSTRUCTIONS.md para padrões.
```

### Exemplo

```
Otimizar cálculo de tamanho para diretórios muito grandes (10.000+ arquivos).
Requisitos:
- Implementar processamento em chunks
- Manter cobertura de testes
- Adicionar feedback de progresso ao usuário
- Documentar nova abordagem

Métrica: < 5 segundos para 10.000 arquivos
```

---

## 🧪 Prompts para Testes

```
Adicionar testes para [componente/função].
Requisitos:
- Padrão AAA (Arrange, Act, Assert)
- Mínimo 80% cobertura
- Testar happy path + edge cases
- Nomes descritivos em PT-BR

Arquivo: backend/tests/unit/[path]/[nome].test.js
```

### Exemplo

```
Adicionar testes para função formatBytes em directoryService.
Casos a testar:
- Números muito pequenos (0-1KB)
- Números normais (1MB, 1GB)
- Números muito grandes (TB+)
- Entradas inválidas (null, string, NaN)
- Verificar formato exato (ex: "1.00 KB")

Mínimo 100% cobertura da função.
```

---

## 📋 Prompts para Refactor

```
Refatorar [componente] para melhorar:
- [aspecto 1: readability, performance, security]
- [aspecto 2]

Restrições:
- Manter testes passando (0 falhas)
- Não mudar comportamento externo
- Atualizar documentação se necessário
```

### Exemplo

```
Refatorar backend/src/services/directoryService.js:
- Melhorar legibilidade (funções muito longas)
- Separar responsabilidades
- Melhorar tratamento de erros

Restrições:
- Todos os 15 testes devem passar
- Comportamento da API não muda
- Atualizar JSDoc se necessário
```

---

## 🔧 Prompts para CI/CD

```
[Problema com CI/CD].

Informações:
- Workflow: [nome]
- Erro: [mensagem de erro]
- Log: [se aplicável]

Verificar:
1. GitHub Actions workflow
2. Dependências Node.js
3. Variáveis de ambiente
```

### Exemplo

```
Testes falhando no GitHub Actions mas passando localmente.

Erro: "Cannot find module 'jest'"
Workflow: ci.yml

Possíveis causas:
- Cache do npm desatualizado
- Versões diferentes de Node.js
- Dependências não instaladas corretamente

Limpar cache e reexecutar.
```

---

## 📖 Padrão Recomendado de Prompt

```
[Contexto breve do que precisa ser feito]

Requisitos:
- [Requisito 1]
- [Requisito 2]
- [Requisito 3]

Restrições:
- Seguir INSTRUCTIONS.md
- [Restrição específica 1]
- [Restrição específica 2]

Entregar:
- [Artefato 1]
- [Artefato 2]
- Commit git com mensagem clara

Dúvidas? Pausar e perguntar antes de prosseguir.
```

---

## 💡 Dicas para Prompts Efetivos

1. **Seja Específico**: Descreva exatamente o que quer
2. **Inclua Contexto**: Citar arquivo, função, erro específico
3. **Defina Restrições**: Qualidade, cobertura, padrões
4. **Estruture Bem**: Use bullet points e formatação clara
5. **Mencione Dependências**: Se afeta outras partes do código
6. **Peça Clarificação**: Se houver ambiguidade, pedir confirmação

---

## 📚 Referências Dentro do Projeto

- [INSTRUCTIONS.md](INSTRUCTIONS.md) - Padrões e regras obrigatórias
- [PRD.md](PRD.md) - Requisitos do projeto
- [README.md](README.md) - Como usar e contribuir

---

**Última atualização:** 15/04/2026  
**Atualizado por:** Allan Donegá
