require("./models/Crypto");

import tokenAddress from "../data/address.json";
import notificationLimits from "../data/notificationLimits.json";
import { getTokenPriceWithDecimals } from "./getTokenPrice";
import { sendMessage } from "./sendTelegramMessage";
import { sendPushNotification } from "./sendExpoNotification";
import { request } from "http";

const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const portfolioRoutes = require("./portfolioRoutes");
const priceRoutes = require("./priceRoutes");

const fs = require("fs");

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
  let msgText = "";

  for (let index in tokenAddress) {
    const result = await getTokenPriceWithDecimals(
      tokenAddress[index].tokenAddress,
      tokenAddress[index].decimal
    );

    msgText += `${tokenAddress[index].name} : ${result}/ETH + \n`;
  }
  sendMessage(msgText);
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
