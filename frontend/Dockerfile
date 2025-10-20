FROM node:18-alpine

WORKDIR /app

# Копіюємо package files
COPY package*.json ./

# Збільшуємо пам'ять Node.js
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Встановлюємо залежності
RUN npm install --legacy-peer-deps

# Копіюємо весь код
COPY . .

# Відкриваємо порт
EXPOSE 3000

# Запускаємо dev server
CMD ["npm", "start"]