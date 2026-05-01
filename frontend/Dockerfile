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


# nginx runner
FROM nginx:alpine

# copy built frontend
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]