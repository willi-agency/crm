FROM node:22.12.0

WORKDIR /app

COPY package*.json ./

RUN npm install

# Copia o restante do código e os arquivos do Prisma
COPY . .

# Gera o Prisma Client com o binaryTarget correto
RUN npx prisma generate

# Compila o TypeScript
RUN npm run build

EXPOSE 3004

CMD ["npx", "ts-node-dev", "--respawn", "src/server.ts"]
