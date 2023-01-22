# Deps
FROM node:16-alpine as deps

WORKDIR /app/bot

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile

# Builder
FROM node:16-alpine as builder

WORKDIR /app/bot

COPY package.json yarn.lock ./
COPY --from=deps /app/bot/node_modules ./node_modules
COPY . .

RUN yarn build

# Runner
FROM node:16-alpine as runner

WORKDIR /app/bot

COPY --from=builder /app/bot/dist ./dist
COPY --from=deps /app/bot/node_modules ./node_modules
COPY package.json ./

CMD ["node", "./dist/main"]