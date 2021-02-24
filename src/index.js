require("./models/Crypto");

const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const portfolioRoutes = require("./portfolioRoutes");
const priceRoutes = require("./priceRoutes");
const graph = require("./graphPriceFetcher");

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

const sendTelegramNotification = async() => {
    const priceDataMessage = await tokenPrice.getPriceData();
    console.log("index msg" + priceDataMessage);
    sendTelegramMessage.sendMessage(priceDataMessage);
    sendDiscordMessage.sendMessageToDiscord(priceDataMessage);
};

app.get("/", (req, res) => {
    console.log('Index method called');
    sendTelegramNotification();
    res.status(200).send("success");
});

app.get("/pair/:fromTicker/:toTicker", async(req, res) => {
    let result = "";
    result = await tokenPrice.getPrice(
        req.params.fromTicker,
        req.params.toTicker
    );
    res.status(200).send(result);
});

app.post("/saveNotificationLimit", async(req, res) => {
    console.log("Save Called");
    console.log(req.body);

    const { expoToken, notifyCrypro } = req.body;
    sendPushNotification(expoToken);
});

app.get("/graphQL", (req, res) => {
    return graph.getPriceFromGraph().then((data) => {
        let result =
            `1hr Max Price : ${1 / data.maxDerivedETH}/ETH $Value : ${
        data.maxDerivedETH * data.maxETHPrice
      } ; ` + "\n";
        result +=
            `1hr Min Price : ${1 / data.minDerivedETH}/ETH $Value : ${
        data.minDerivedETH * data.minETHPrice
      } ; ` + "\n";
        return res.status(200).send(result);
    });
});

app.listen(port, () => {
    console.log("started");
});