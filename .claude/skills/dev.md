# Dev Server - Identify Directories Size

Inicia o servidor de desenvolvimento e verifica se a aplicação está funcionando corretamente.

## Uso

```
/dev
```

## Instruções

### 1. Verifique o Ambiente
- Confirme que `node_modules` existe: `ls node_modules` na raiz do projeto
- Se não existir, execute `npm install` antes de continuar

### 2. Inicie o Servidor
Execute na raiz do projeto:
```bash
cd C:\workspace\VsCodeProjects\identify-directories-size && npm run dev
```

O servidor inicia em `http://localhost:3000` (ou a porta definida em `.env`).

### 3. Verifique os Endpoints Principais

Após o servidor iniciar, confirme que os endpoints estão respondendo:

- **Frontend**: `GET http://localhost:3000/` → deve retornar o HTML da interface
- **Health / API**: `GET http://localhost:3000/api/v1/directory` → deve retornar resposta JSON

### 4. Reporte o Status

Apresente:
- URL da aplicação
- Porta em uso
- Modo (development/production)
- Endpoints disponíveis na API (`/api/v1/...`)
- Qualquer erro ou aviso no startup

### 5. Dicas de Troubleshooting

Se a porta 3000 estiver em uso:
- No Windows: `netstat -ano | findstr :3000` para ver o processo
- Altere a porta no `.env` (copie de `.env.example` se não existir)

Se faltar dependências:
- Execute `npm install` na raiz
- Execute `npm install` em `backend/` também se necessário
