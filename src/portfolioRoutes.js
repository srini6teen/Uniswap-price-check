const tokenAddress = require("../data/address.json")
const express = require("express");
const mongoose = require("mongoose");

const Crypto = mongoose.model("Crypto");

const router = express.Router();

router.get("/portfolioTarget/:expoToken", async (req, res) => {
  const expoToken = req.params.expoToken;
  console.log(expoToken);
  try {
    const crypto = await Crypto.find({
      expoToken: expoToken,
    });
    for (let index in tokenAddress) {
      let flag = false;
      const result = crypto[0].portfolioTarget.filter((x) => {
        {
          flag = false;

          if (x.name.toUpperCase() == tokenAddress[index].name.toUpperCase()) {
            return x;
          }
        }
      });
      if (result.length == 0)
        crypto[0].portfolioTarget.push({
          name: tokenAddress[index].name,
          price: 0,
        });
    }

    res.send(crypto);
  } catch (err) {
    res.status(422).send({ error: err.message });
  }
});

router.post("/savePortfolioTarget", async (req, res) => {
  const { expoToken, portfolioTarget } = req.body;
  try {
    Crypto.findOne({ expoToken: expoToken }, (err, crypto) => {
      if (!crypto) crypto = new Crypto();
      crypto.expoToken = expoToken;
      crypto.portfolioTarget = portfolioTarget;

      crypto.save();
    });

    res.status(200).send("");
  } catch (err) {
    res.status(422).send({ error: err.message });
  }
});

module.exports = router;
