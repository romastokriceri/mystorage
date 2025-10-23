# Використовуємо офіційний образ Nginx
FROM nginx:stable-alpine

# Видаляємо дефолтну конфігурацію
RUN rm /etc/nginx/conf.d/default.conf

# Копіюємо свій nginx.conf у корінь nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Копіюємо SSL (якщо є)
COPY ssl /etc/nginx/ssl

# Відкриваємо порти
EXPOSE 80
EXPOSE 443

# Перевіряємо синтаксис під час запуску (опціонально)
CMD ["nginx", "-g", "daemon off;"]
