# stage one
FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json  ./

RUN npm install --omit=dev

# stage two
FROM node:22-alpine

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY . .

EXPOSE 5000

CMD [ "node", "index.js" ]
