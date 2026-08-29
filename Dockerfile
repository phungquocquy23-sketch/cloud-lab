FROM node:18
WORKDIR /app
COPY cloud-lab/server/package*.json ./
RUN npm install
COPY cloud-lab/server/ .
EXPOSE 5000
CMD ["npm", "start"]
