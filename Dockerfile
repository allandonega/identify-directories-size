# Dockerfile
FROM node:20.15.1-alpine

# Definir diretório de trabalho
WORKDIR /app

# Copiar package.json
COPY package*.json ./
COPY backend/package*.json ./backend/

# Instalar dependências
RUN npm install
RUN cd backend && npm install && cd ..

# Copiar código-fonte
COPY . .

# Expor porta
EXPOSE 3000

# Variável de ambiente
ENV NODE_ENV=production

# Comando de inicialização
CMD ["npm", "start"]
