const Discord = require("discord.js");
const client = new Discord.Client();
const fs = require("fs");
const tokenPrice = require("./getTokenPrice");
const jsYaml = require("js-yaml");
const e = require("express");
const path = require("path");
const { getPriceFromGraph } = require("./graphPriceFetcher");

const file = fs.readFileSync(path.resolve(__dirname, "../settings.yaml"));
const settings = jsYaml.safeLoad(file);
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
  message += "--------------------------------";
  message = "```" + message + "```";
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
    if (token == "ETH") {
      price = await tokenPrice.getPrice("ETH", "USDT");
    } else {
      price = await tokenPrice.getPrice("ETH", commandArray[1].toUpperCase());
    }

    let result = "";
    await getPriceFromGraph(token).then((data) => {
      // if (token == "ETH") {
      //   result = `${token} : USD ${data.currentTokenPrice}` + "\n";
      // } else {
      //   result = `${token} : ${1 / data.currentTokenPrice}/ETH` + "\n";
      // }

      if (token != "ETH") {
        result +=
          `1hr Max Price : ${parseFloat(1 / data.maxDerivedETH).toFixed(
            2
          )}/ETH` + "\n";
        result +=
          `1hr Min Price : ${parseFloat(1 / data.minDerivedETH).toFixed(
            2
          )}/ETH` + "\n";
      }
      result +=
        `1hr Max USD Price : USD ${parseFloat(
          data.maxDerivedETH * data.maxETHPrice
        ).toFixed(2)}` + "\n";
      result +=
        `1hr Min USD Price : USD ${parseFloat(
          data.minDerivedETH * data.minETHPrice
        ).toFixed(2)}` + "\n";
      let volumnChange = data.endBlockVolumnUSD - data.startBlockVolumnUSD;
      let volumnChangePercent = (volumnChange / data.startBlockVolumnUSD) * 100;
      result +=
        `Volume Change(1hr) : USD ${parseFloat(volumnChange).toFixed(2)}` +
        "\n";
      result +=
        `Volume Change(1hr) % : ${parseFloat(volumnChangePercent).toFixed(
          2
        )}%` + "\n";
    });
    price += "\n" + result;
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
