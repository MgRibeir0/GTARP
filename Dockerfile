FROM node:18.15.0

# Create the bot's directory

RUN mkdir -p /usr/src/bot

WORKDIR /usr/src/bot

COPY package.json /usr/src/bot

RUN npm install

COPY . /usr/src/bot

# Start the bot.

CMD ["npm", "run" ,"bot"]