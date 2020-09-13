require("./models/Crypto");

const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const portfolioRoutes = require("./portfolioRoutes");
const priceRoutes = require("./priceRoutes");

const tokenPrice = require("./getTokenPrice");
const sendPushNotification = require("./sendExpoNotification");
const sendTelegramMessage = require("./sendTelegramMessage");
const sendDiscordMessage = require("./sendDiscordMessage");

const fs = require("fs");
const e = require("express");

const app = express();

app.use(bodyParser.json());
app.use(portfolioRoutes);
app.use(priceRoutes);

var port = process.env.PORT || 3000;
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const mongoUri =
  "mongodb+srv://sa:passwordpassword@cluster0.brfri.mongodb.net/Test?retryWrites=true&w=majority";
mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useCreateIndex: true,
});

mongoose.connection.on("connected", () => {
  console.log("connected to mongo instance");
});

mongoose.connection.on("error", (err) => {
  console.log("Error connecting to mongog", err);
});

const sendTelegramNotification = async () => {
  const priceDataMessage = await tokenPrice.getPriceData();
  sendTelegramMessage.sendMessage(priceDataMessage);
  sendDiscordMessage.sendMessageToDiscord(priceDataMessage);
};

app.get("/", (req, res) => {
  sendTelegramNotification();
  res.status(200).send("success");
});

app.post("/saveNotificationLimit", async (req, res) => {
  console.log("Save Called");
  console.log(req.body);

  const { expoToken, notifyCrypro } = req.body;
  sendPushNotification(expoToken);
});

app.listen(port, () => {
  console.log("started");
});
