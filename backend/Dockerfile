FROM node:22.19.0-alpine

RUN apk add --no-cache bash ffmpeg
RUN npm i -g @nestjs/cli typescript@5.9.2 ts-node

COPY package*.json /tmp/app/
RUN cd /tmp/app && npm ci

COPY . /usr/src/app
RUN rm -rf /usr/src/app/test
RUN cp -a /tmp/app/node_modules /usr/src/app
COPY ./wait-for-it.sh /opt/wait-for-it.sh
RUN chmod +x /opt/wait-for-it.sh
COPY ./startup.dev.sh /opt/startup.dev.sh
RUN chmod +x /opt/startup.dev.sh
RUN sed -i 's/\r//g' /opt/wait-for-it.sh
RUN sed -i 's/\r//g' /opt/startup.dev.sh

WORKDIR /usr/src/app
RUN if [ ! -f .env ]; then cp .env.example .env; fi
RUN npm run build

CMD ["/opt/startup.dev.sh"]
