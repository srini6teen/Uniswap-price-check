const UNISWAP = require("@uniswap/sdk");
const tokenAddress = require("../data/address.json");
const { WETH } = require("@uniswap/sdk");

const tokenDetails = {};
for (let token in tokenAddress) {
  tokenDetails[tokenAddress[token].ticker.toUpperCase()] = tokenAddress[token];
}

const getTokens = async () => {
  return Object.keys(tokenDetails).join(", ");
};

const getPrice = async (inputTicker, outputTicker) => {
  try {
    const fromToken = tokenDetails[inputTicker];
    const toToken = tokenDetails[outputTicker];

    const inputToken = new UNISWAP.Token(
      UNISWAP.ChainId.MAINNET,
      fromToken.tokenAddress,
      fromToken.decimal
    );

    const outputToken = new UNISWAP.Token(
      UNISWAP.ChainId.MAINNET,
      toToken.tokenAddress,
      toToken.decimal
    );

    const pair = await UNISWAP.Fetcher.fetchPairData(outputToken, inputToken);

    const route = new UNISWAP.Route([pair], inputToken);

    let decimals = Math.pow(10, fromToken.decimal);

    let tokenAmount = new UNISWAP.TokenAmount(inputToken, decimals);

    const trade = new UNISWAP.Trade(
      route,
      tokenAmount,
      UNISWAP.TradeType.EXACT_INPUT
    );

    const result = trade.executionPrice.toSignificant(6);

    var msg;
    if (inputTicker == "ETH" && outputTicker == "USDT") {
      msg = `ETH : USD ${result}`;
    } else {
      msg = `${toToken.ticker} : ${result}/${fromToken.ticker}`;
    }
    return msg;
  } catch (err) {
    console.log("exception");
    console.log(err);
  }
};

const getPriceData = async () => {
  let msgText = "";

  for (let index in tokenAddress) {
    let result = "";

    if (tokenAddress[index].ticker.toUpperCase() == "ETH") continue;

    if (tokenAddress[index].ticker.toLocaleUpperCase() == "HGET") {
      result = await getPrice(tokenAddress[index].ticker, "USDT");
    } else {
      result = await getPrice("ETH", tokenAddress[index].ticker);
    }
    msgText += result + "\n";
  }
  return msgText;
};

module.exports = {
  getPriceData,
  getTokens,
  getPrice,
};
