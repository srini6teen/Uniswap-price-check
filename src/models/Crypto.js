const mongoose = require("mongoose");

const coninSchema = new mongoose.Schema({
  name: {
    type: String,
    index: {
      collation: { locale: "en", strength: 2 },
    },
  },
  price: Number,
});

const cryptoSchema = new mongoose.Schema({
  expoToken: {
    type: String,
    required: true,
    unique: true,
  },
  portfolioTarget: [coninSchema],
});

mongoose.model("Crypto", cryptoSchema);
