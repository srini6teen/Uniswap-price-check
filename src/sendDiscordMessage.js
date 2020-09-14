const Discord = require("discord.js");
const client = new Discord.Client();
const fs = require("fs");
const tokenPrice = require("./getTokenPrice");
const jsYaml = require("js-yaml");
const e = require("express");

const settings = jsYaml.safeLoad(fs.readFileSync("settings.yaml"));
const discordSettings = settings.discord;
client.login(discordSettings.token);

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on("message", async (msg) => {
  var command = msg.content;
  if (command.toLowerCase().startsWith("price")) {
    await getPriceDetails(command);
  } else if (command.toLowerCase() == "tokens") {
    var tokens = await tokenPrice.getTokens();
    sendMessageToDiscord(tokens);
  }
});

const sendMessageToDiscord = (message) => {
  client.channels.cache
    .find((channel) => channel.id === discordSettings.channelId)
    .send(message);
};

const getPriceDetails = async (priceCommand) => {
  priceCommand = priceCommand.trim();
  var commandArray = priceCommand.split(" ");
  var price;
  if (commandArray.length == 1) {
    price = await tokenPrice.getPriceData();
  } else if (commandArray.length == 2) {
    var token = commandArray[1].toUpperCase();
    // Hack for asking price of ETH
    if (token == 'ETH') {
      price = await tokenPrice.getPrice(
        'ETH',
        'USDT'
      );
    } else {
      price = await tokenPrice.getPrice(
        'ETH',
        commandArray[1].toUpperCase()
      );
    }
  } else if (commandArray.length == 3) {
    price = await tokenPrice.getPrice(
      commandArray[1].toUpperCase(),
      commandArray[2].toUpperCase()
    );
  }
  sendMessageToDiscord(price);
};

module.exports = {
  sendMessageToDiscord,
};
