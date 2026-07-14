FROM node:20-alpine

WORKDIR /app

# Build-Tools für native Module (bcrypt wird aus dem Quellcode kompiliert)
RUN apk add --no-cache python3 make g++

# Packagedateien kopieren
COPY package*.json ./

# Abhängigkeiten installieren
RUN npm install

# Den restlichen Code kopieren
COPY . .

# Next.js App bauen
RUN npm run build

# Port für Next.js definieren
EXPOSE 3000

# App im Production-Modus starten
CMD ["npm", "run", "start"]