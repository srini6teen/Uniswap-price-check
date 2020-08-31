const tokenPrice = require("./getTokenPrice");
const sendPushNotification = require("./sendExpoNotification");

const tokenAddress = require("../data/address.json")

const express = require("express");

const router = express.Router();

const mongoose = require("mongoose");

const Crypto = mongoose.model("Crypto");

const getLatestCryptoPrice = async () => {
  let price = [];
  let promises = new Map();
  for (let index in tokenAddress) {
    const token = tokenAddress[index];
    promises.set(
      token.name,
      tokenPrice.getTokenPriceWithDecimals(token.tokenAddress, token.decimal)
    );
  }

  for (const [key, value] of promises.entries()) {
    price.push({
      name: key,
      price: await Promise.resolve(value),
    });
  }

  return price;
};

router.get("/price", async (req, res) => {
  try {
    const price = await getLatestCryptoPrice();
    res.send(price);
  } catch (err) {
    console.log(err);
  }
});

const checkTargetPrice = async () => {
  const cryptoPrice = await getLatestCryptoPrice();
  let targetPortfolios = [];
  cryptoPrice.map((x) => {
    const result = Crypto.find({
      "portfolioTarget.name": x.name,
      "portfolioTarget.price": { $gte: x.price, $gt: 0 },
    })
      .collation({ locale: "en", strength: 2 })
      .then((results) => {
        if (results) {
          for (let index in results) {
            const portfolio = results[index].portfolioTarget;
            for (let i in portfolio) {
              if (
                portfolio[i].name.toLocaleUpperCase() ==
                  x.name.toLocaleUpperCase() &&
                portfolio[i].price > 0 &&
                x.price <= portfolio[i].price
              ) {
                sendPushNotification(results[index].expoToken, x.name, x.price);
              }
            }
          }
        }
      });
  });
};

router.get("/checkTargetPrice", async (req, res) => {
  await checkTargetPrice();
  res.status(200).send("");
});

module.exports = router;
