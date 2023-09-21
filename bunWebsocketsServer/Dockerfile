FROM oven/bun

WORKDIR /app

COPY . /app

RUN bun install

ARG PORT
EXPOSE ${PORT:-3000}

CMD ["bun", "run", "index.ts"]
