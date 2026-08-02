# /******************************************************************************
#  * Project        : EAORCS - The Software Trust Platform
#  * Module         : Docker Container Deployment Manifest
#  * File           : Dockerfile
#  * Version        : 2026.1-LTS
#  * Organization   : Ujomor Systems Engineering
#  * Classification : ENTERPRISE
#  ******************************************************************************/

FROM node:20-alpine AS build

WORKDIR /app

COPY package.json ./
RUN npm install --production

COPY . .

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV DOCKER_CONTAINER=true

COPY --from=build /app ./

EXPOSE 8080

ENTRYPOINT ["node", "cli/index.js"]
CMD ["audit", "run"]
