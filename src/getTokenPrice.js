const UNISWAP = require("@uniswap/sdk");

const getTokenPriceWithDecimals = async (tokenAddress, decimal) => {
  try {
    const DAI = new UNISWAP.Token(
      UNISWAP.ChainId.MAINNET,
      tokenAddress,
      decimal
    );
    const pair = await UNISWAP.Fetcher.fetchPairData(
      DAI,
      UNISWAP.WETH[DAI.chainId]
    );
    const route = new UNISWAP.Route([pair], UNISWAP.WETH[DAI.chainId]);
    let tokenAmount = new UNISWAP.TokenAmount(
      UNISWAP.WETH[DAI.chainId],
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
};
