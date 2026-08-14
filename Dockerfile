# Production-ready lightweight Alpine Nginx image
FROM nginx:alpine

# Copy Nginx template for dynamic ${PORT} substitution by Nginx entrypoint
COPY nginx.conf.template /etc/nginx/templates/default.conf.template

# Copy web application assets to Nginx html directory
COPY index.html /usr/share/nginx/html/
COPY style.css /usr/share/nginx/html/
COPY script.js /usr/share/nginx/html/

# Default Render HTTP port
ENV PORT=10000

# Expose default port
EXPOSE 10000

# Start Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
