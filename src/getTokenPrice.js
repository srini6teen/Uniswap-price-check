import {
  ChainId,
  Token,
  TokenAmount,
  WETH,
  Fetcher,
  Route,
  Trade,
  TradeType,
} from "@uniswap/sdk";

export const getTokenPrice = async (tokenAddress) => {
  const DAI = new Token(ChainId.MAINNET, tokenAddress, 9);
  const pair = await Fetcher.fetchPairData(DAI, WETH[DAI.chainId]);
  const route = new Route([pair], WETH[DAI.chainId]);

  try {
    let tokenAmount = new TokenAmount(WETH[DAI.chainId], "1000000000000000000");

    const trade = new Trade(route, tokenAmount, TradeType.EXACT_INPUT);
    //console.log(trade.executionPrice.toSignificant(6));

    return trade.executionPrice.toSignificant(6);
    // console.log(trade.nextMidPrice.toSignificant(6));

    // console.log(route.midPrice.toSignificant(18)); // 201.306
    // console.log(route.midPrice.invert().toSignificant(18)); // 0.00496756
  } catch (err) {
    console.log("exception");
    console.log(err);
  }
};

export const getTokenPriceWithDecimals = async (tokenAddress, decimal) => {
  const DAI = new Token(ChainId.MAINNET, tokenAddress, decimal);
  const pair = await Fetcher.fetchPairData(DAI, WETH[DAI.chainId]);
  const route = new Route([pair], WETH[DAI.chainId]);

  try {
    let tokenAmount = new TokenAmount(WETH[DAI.chainId], "1000000000000000000");

    const trade = new Trade(route, tokenAmount, TradeType.EXACT_INPUT);
    //console.log(trade.executionPrice.toSignificant(6));

    return trade.executionPrice.toSignificant(6);
    // console.log(trade.nextMidPrice.toSignificant(6));

    // console.log(route.midPrice.toSignificant(18)); // 201.306
    // console.log(route.midPrice.invert().toSignificant(18)); // 0.00496756
  } catch (err) {
    console.log("exception");
    console.log(err);
  }
};
