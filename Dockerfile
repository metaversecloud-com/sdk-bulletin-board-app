FROM --platform=linux/arm64 node:20.10-alpine3.19
WORKDIR /app
COPY . ./
EXPOSE 3000
CMD ["node", "./server/build/index.js"]
