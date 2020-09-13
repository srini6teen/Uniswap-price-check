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
  const tokenDetail = tokenDetails[tokenTicker];
  const result = await getTokenPriceWithDecimals(
    tokenDetail.tokenAddress,
    tokenDetail.decimal
  );

  if (tokenTicker == "ETH") {
    msgText += `${tokenTicker} : USD ${result}`;
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
    const result = await getTokenPriceWithDecimals(
      tokenAddress[index].tokenAddress,
      tokenAddress[index].decimal
    );

    if (tokenAddress[index].name == "ETH") {
      msgText += `${tokenAddress[index].name} : USD ${result}`;
      msgText += "\n";
    } else {
      msgText += `${tokenAddress[index].name} : ${result}/ETH`;
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

module.exports = {
  getTokenPriceWithDecimals,
  getPriceData,
  getPriceDataForToken,
  getTokens,
};
