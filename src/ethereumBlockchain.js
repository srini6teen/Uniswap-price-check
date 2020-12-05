var Web3 = require("web3");

let web3 = new Web3(
  // Replace YOUR-PROJECT-ID with a Project ID from your Infura Dashboard
  new Web3.providers.WebsocketProvider(
    "wss://mainnet.infura.io/ws/v3/02e3301c24ba46d2a4071153f2fee79d"
  )
);

var subscription = web3.eth.subscribe(
  "logs",
  {
    address: [
      "0x0ff6ffcfda92c53f615a4a75d982f399c989366b",
      "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
      "0xb1a824a6caf1f789aa7ca1072e36e83cd62ba3ee",
    ],
    topics: [
      ["0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"],
      ["0xd78ad95fa46c994b6551d0da85fc275fe613ce37657fb8d5e3d130840159d822"],
    ],
  },
  function (error, result) {
    if (error) {
      console.log(result);
    }
  }
);

subscription.unsubscribe(function (error, success) {
  if (error) console.log("Successfully unsubscribed!");
});

module.exports = { subscription };
