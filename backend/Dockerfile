# build app
FROM node:25-alpine3.22 as build
WORKDIR /app
COPY package*.json ./
RUN npm install 
COPY . .
RUN npm run build


# build and clean node_modules
FROM node:25-alpine3.22 as buildcleandep
WORKDIR /dep
RUN npm install modclean -g 
COPY package*.json ./
RUN npm install --only=production
RUN modclean --run --no-progress


# main runner
FROM alpine:3.22

# add nodejs
RUN apk add --no-cache nodejs wget


WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=buildcleandep /dep ./

EXPOSE 3000

CMD [ "node", "dist/index.js" ]
