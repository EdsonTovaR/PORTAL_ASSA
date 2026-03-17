# Usamos una imagen ligera de Node.js
FROM node:20-alpine

WORKDIR /app

# Copiamos los archivos de configuración y descargamos dependencias
COPY package*.json ./
RUN npm install

# Copiamos el resto del código de React
COPY . .

# Exponemos el puerto de Vite y encendemos el servidor de desarrollo
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host"]