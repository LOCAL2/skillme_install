FROM oven/bun:1-alpine
WORKDIR /app

COPY package.json bun.lock ./
RUN bun install

COPY . .

EXPOSE 5174

CMD ["bun", "run", "dev"]
