FROM node:latest

# Create app directory
WORKDIR /usr/src

# Install app dependencies
COPY package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY . .

RUN npm run build
CMD [ "npm", "run", "start" ]