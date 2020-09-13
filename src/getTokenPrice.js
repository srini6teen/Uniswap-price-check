const UNISWAP = require("@uniswap/sdk");
const tokenAddress = require("../data/address.json");
const { WETH } = require("@uniswap/sdk");

const tokenDetails = {};
for (let token in tokenAddress) {
  tokenDetails[tokenAddress[token].ticker] = tokenAddress[token];
}

const getTokens = async () => {
  return Object.keys(tokenDetails).join(", ");
};

const getPriceDataForToken = async (tokenTicker) => {
  let msgText = "";
  let result = "";
  const tokenDetail = tokenDetails[tokenTicker];

  if (tokenTicker.toLocaleUpperCase() == "HGET")
    result = await getUSDTPairTokenPrice(
      tokenDetail.tokenAddress,
      tokenDetail.decimal
    );
  else
    result = await getTokenPriceWithDecimals(
      tokenDetail.tokenAddress,
      tokenDetail.decimal
    );

  if (tokenTicker == "ETH") {
    msgText += `${tokenTicker} : USD ${result}`;
    msgText += "\n";
  } else if (tokenTicker.toLocaleUpperCase() == "HGET") {
    msgText += `${tokenTicker} : ${result}/USDT`;
    msgText += "\n";
  } else {
    msgText += `${tokenTicker} : ${result}/ETH`;
    msgText += "\n";
  }
  return msgText;
};

const getPriceData = async () => {
  let msgText = "";

  for (let index in tokenAddress) {
    let result = "";

    if (tokenAddress[index].ticker.toLocaleUpperCase() == "HGET")
      result = await getUSDTPairTokenPrice(
        tokenAddress[index].tokenAddress,
        tokenAddress[index].decimal
      );
    else
      result = await getTokenPriceWithDecimals(
        tokenAddress[index].tokenAddress,
        tokenAddress[index].decimal
      );

    if (tokenAddress[index].ticker == "ETH") {
      msgText += `${tokenAddress[index].ticker} : USD ${result}`;
      msgText += "\n";
    } else if (tokenAddress[index].ticker.toLocaleUpperCase() == "HGET") {
      msgText += `${tokenAddress[index].ticker} : ${result}/USDT`;
      msgText += "\n";
    } else {
      msgText += `${tokenAddress[index].ticker} : ${result}/ETH`;
      msgText += "\n";
    }
  }
  return msgText;
};

const getTokenPriceWithDecimals = async (tokenAddress, decimal) => {
  try {
    const outputToken = new UNISWAP.Token(
      UNISWAP.ChainId.MAINNET,
      tokenAddress,
      decimal
    );
    const pair = await UNISWAP.Fetcher.fetchPairData(
      outputToken,
      UNISWAP.WETH[outputToken.chainId]
    );
    const route = new UNISWAP.Route([pair], UNISWAP.WETH[outputToken.chainId]);
    let tokenAmount = new UNISWAP.TokenAmount(
      UNISWAP.WETH[outputToken.chainId],
      "1000000000000000000"
    );

    const trade = new UNISWAP.Trade(
      route,
      tokenAmount,
      UNISWAP.TradeType.EXACT_INPUT
    );

    return trade.executionPrice.toSignificant(6);
  } catch (err) {
    console.log("exception");
    console.log(err);
  }
};

const getUSDTPairTokenPrice = async (tokenAddress, decimal) => {
  try {
    const USDT = new UNISWAP.Token(
      UNISWAP.ChainId.MAINNET,
      "0xdac17f958d2ee523a2206206994597c13d831ec7",
      6
    );
    const HGET = new UNISWAP.Token(
      UNISWAP.ChainId.MAINNET,
      tokenAddress,
      decimal
    );

    const USDTHGETPair = await UNISWAP.Fetcher.fetchPairData(USDT, HGET);

    const route = new UNISWAP.Route([USDTHGETPair], USDT);

    let tokenAmount = new UNISWAP.TokenAmount(USDT, "1000000");

    const trade = new UNISWAP.Trade(
      route,
      tokenAmount,
      UNISWAP.TradeType.EXACT_INPUT
    );

    return trade.executionPrice.toSignificant(6);
  } catch (err) {
    console.log("exception");
    console.log(err);
  }
};

module.exports = {
  getTokenPriceWithDecimals,
  getPriceData,
  getPriceDataForToken,
  getTokens,
  getUSDTPairTokenPrice,
};
