# Base image
FROM node:12.17.0-alpine3.10

# Creating a directory inside the base image and defining as the base directory
WORKDIR /app

# Copying the files of the root directory into the base directory
ADD . /app

# Installing the project dependencies
RUN npm install -y
RUN npm install pm2 -g
RUN yarn

# Starting the pm2 process and keeping the docker container alive
CMD ["pm2-runtime", "npm", "--", "start"]

# Exposing the RestAPI port
EXPOSE 4000
