import tokenAddress from "../data/address.json";
import { getTokenPrice, getTokenPriceWithDecimals } from "./getTokenPrice";
import { sendPushNotification } from "./sendExpoNotification";

const express = require("express");

const router = express.Router();

const mongoose = require("mongoose");

const Crypto = mongoose.model("Crypto");

const getLatestCryptoPrice = async () => {
  let price = [];
  for (let index in tokenAddress) {
    const token = tokenAddress[index];
    const result = await getTokenPriceWithDecimals(token.tokenAddress, token.decimal);
    price.push({ name: tokenAddress[index].name, price: result });
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
    //console.log(x);

    const result = Crypto.find({
      "portfolioTarget.name": x.name,
      "portfolioTarget.price": { $gte: x.price, $gt: 0 },
    }) // "portfolioTarget.price": { $gte: x.price },
      .collation({ locale: "en", strength: 2 })
      .then((results) => {
        if (results) {
          for (let index in results) {
            //console.log(results[index]);
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
            // if (
            //   results[index].name.toLocaleUpperCase() ==
            //     x.name.toLocaleUpperCase() &&
            //   results[index].price > 0 &&
            //   x.price >= results[index].price
            // ) {
            //   sendPushNotification(results[index].expoToken, x.name, x.price);
            // }

            //sendPushNotification(results[index].expoToken, x.name, x.price);
            // targetPortfolios.push({
            //   expoToken: results[index].expoToken,
            //   message: `${x.name} : ${x.price}`,
            // });
          }
        }
        // if (results != null) console.log(`result is ${results}`);
      });
  });
};

router.get("/checkTargetPrice", async (req, res) => {
  await checkTargetPrice();
  res.status(200).send("");
});

module.exports = router;
