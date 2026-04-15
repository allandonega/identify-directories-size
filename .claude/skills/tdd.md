# TDD Workflow - Identify Directories Size

Guia o ciclo TDD completo (Red → Green → Refactor) para implementar uma nova feature neste projeto.

## Uso

```
/tdd <descrição da feature>
```

Exemplo: `/tdd endpoint para abrir pasta no explorador do sistema`

## Instruções

Siga rigorosamente o fluxo abaixo para implementar a feature descrita:

### 1. Analise o Contexto
- Leia os arquivos relevantes em `backend/src/` e `backend/tests/`
- Identifique onde a feature se encaixa na arquitetura existente (service, route, controller)
- Verifique se há testes existentes relacionados

### 2. RED — Escreva os Testes Primeiro
- Crie ou atualize o arquivo de teste apropriado em `backend/tests/unit/` ou `backend/tests/integration/`
- Use o padrão AAA: Arrange, Act, Assert
- Nomes descritivos: `it('deve retornar X quando Y')`
- Execute `npm test` na raiz e confirme que os novos testes FALHAM (esperado nesta fase)

### 3. GREEN — Implemente o Mínimo Necessário
- Implemente o código mínimo para os testes passarem
- Siga os padrões do projeto: ES6+, sem semicolons, camelCase
- Execute `npm test` e confirme que TODOS os testes passam

### 4. REFACTOR — Melhore a Qualidade
- Remova duplicação de código
- Melhore legibilidade se necessário
- Execute `npm test` novamente para confirmar que ainda passa

### 5. Verifique Cobertura
- Execute `npm test` (inclui `--coverage` automaticamente)
- Confirme que a cobertura está ≥ 80%
- Se abaixo de 80%, adicione testes para os casos não cobertos

### 6. Lint e Format
- Execute `npm run lint` para verificar erros
- Execute `npm run format` para formatar o código

### 7. Reporte o Resultado
Apresente um resumo com:
- O que foi implementado
- Quais testes foram criados
- % de cobertura atual
- Próximos passos sugeridos (se houver)
