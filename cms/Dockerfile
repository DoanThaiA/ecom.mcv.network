FROM node:18

WORKDIR /client

COPY package*.json ./
RUN npm install --production=false

COPY . .
RUN rm -rf node_modules && npm install --production=false
RUN npm run build

# Copy version.json to dist for serving
COPY version.json ./dist/version.json

EXPOSE 3000

ENTRYPOINT ["npm", "run", "start"]

