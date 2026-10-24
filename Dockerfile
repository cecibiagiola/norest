FROM node:22-alpine

WORKDIR /app

# Primero solo los package*.json: así Docker cachea la instalación de dependencias
# y no la repite si solo cambiaste el código.
COPY package*.json ./
RUN npm ci --omit=dev

COPY app.js server.js reclamos.json ./

ENV PORT=3000
EXPOSE 3000

# No corremos como root.
USER node

CMD ["node", "server.js"]
