# =========================
# 1. Build
# =========================
FROM node:22-alpine AS build

WORKDIR /app

# Copia os arquivos de dependências
COPY package*.json ./

# Instala dependências
RUN npm ci

# Copia o restante do projeto
COPY . .

# Gera o build do Vite
RUN npm run build


# =========================
# 2. Production
# =========================
FROM nginx:alpine

# Remove configuração padrão do Nginx
RUN rm -rf /usr/share/nginx/html/*

# Copia o build do React/Vite
COPY --from=build /app/dist /usr/share/nginx/html

# Configuração do Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Porta HTTP
EXPOSE 80

# Inicia o Nginx
CMD ["nginx", "-g", "daemon off;"]