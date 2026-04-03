### Stage One ###
ARG BUILDER=oven/bun:1.2.2-alpine
ARG APP_RUNNER=nginx:mainline-alpine3.18-slim

FROM ${BUILDER} AS build
ARG VITE_BASE_URL="/"
# VITE_SYNORA_* и прочие секреты — из .env.production (ENV_FILE в CI), не из пустых build-arg

WORKDIR /app

COPY package*.json ./
RUN bun install

COPY . .
RUN bunx --bun vite build

### Stage Two ###
FROM ${APP_RUNNER}
ARG BUILD_VERSION

COPY --from=build /app/dist /usr/share/nginx/html
COPY entrypoint.sh /app/
RUN chmod +x /app/entrypoint.sh

ENV ENV=prod
EXPOSE 80

# Metadata
LABEL app.version="${BUILD_VERSION}"

ENTRYPOINT ["/app/entrypoint.sh"]
CMD ["-g", "daemon off;"]
