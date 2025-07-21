# Usa uma imagem base oficial do Node.js, mais leve para produção
FROM node:20-alpine

# Define o diretório de trabalho dentro do contêiner
WORKDIR /app

# Copia os arquivos package.json e package-lock.json para instalar as dependências
# Isso otimiza o cache do Docker, pois as dependências só serão reinstaladas se esses arquivos mudarem
COPY api-gateway/package*.json ./

# Instala as dependências do Node.js
# `--omit=dev` para não instalar dependências de desenvolvimento em produção
RUN npm install --omit=dev

COPY ../proto ./proto

# Copia todo o restante do código da aplicação para o diretório de trabalho
COPY api-gateway/ .

# Constrói o aplicativo NestJS
# `npm run build` assume que você tem um script "build" no seu package.json que compila TypeScript
RUN npm run build

# Expõe a porta que o aplicativo escutará (ex: 9000 para API Gateway, 50051 para Users Service gRPC)
# Você precisará ajustar esta porta em cada Dockerfile, conforme o serviço
EXPOSE 9000

# Comando para iniciar a aplicação quando o contêiner for executado
# `npm run start:prod` assume que você tem um script "start:prod" no seu package.json
CMD ["npm", "run", "start:dev"]