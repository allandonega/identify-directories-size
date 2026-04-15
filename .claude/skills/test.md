# Test Runner - Identify Directories Size

Executa todos os testes do projeto, analisa a cobertura e reporta o que está passando, falhando e o que precisa de atenção.

## Uso

```
/test
/test unit
/test integration
```

## Instruções

### 1. Execute os Testes

Dependendo dos argumentos:
- Sem argumento → `cd C:\workspace\VsCodeProjects\identify-directories-size && npm test`
- `unit` → `npm run test:unit`
- `integration` → `npm run test:integration`

### 2. Analise os Resultados

Após a execução, apresente um relatório claro com:

**Status Geral:**
- Total de testes: X passando / Y falhando / Z ignorados
- Cobertura: X% (meta mínima: 80%)

**Testes Falhando (se houver):**
Para cada falha, mostre:
- Nome do teste
- Erro encontrado
- Causa provável
- Sugestão de fix

**Cobertura por Arquivo:**
Liste os arquivos com cobertura abaixo de 80% e sugira quais casos de teste estão faltando.

**Ação Recomendada:**
- Se tudo passa e cobertura ≥ 80%: confirme que o projeto está saudável
- Se há falhas: priorize-as e proponha correções
- Se cobertura < 80%: indique quais testes adicionar

### 3. Diagnóstico Extra (se necessário)

Se um teste falhar por motivo não óbvio:
- Leia o arquivo de teste relevante
- Leia o código-fonte correspondente
- Identifique a discrepância entre expectativa e implementação
