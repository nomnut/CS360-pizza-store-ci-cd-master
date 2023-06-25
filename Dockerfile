FROM node:16
WORKDIR /pizza
COPY . /pizza
WORKDIR /pizza/backend
RUN npm install
WORKDIR /pizza/client
RUN npm install
RUN npm run build
WORKDIR /pizza
CMD ["npm" , "start"]