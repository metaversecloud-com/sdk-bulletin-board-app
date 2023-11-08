FROM --platform=linux/arm64 node:18-alpine3.17
WORKDIR /app
COPY . ./
RUN npm install
EXPOSE 3000
RUN npm run build:prod
CMD ["node", "./server/build/index.js"]
