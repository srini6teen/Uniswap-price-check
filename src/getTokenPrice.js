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

export const getTokenPriceWithDecimals = async (tokenAddress, decimal) => {
  const DAI = new Token(ChainId.MAINNET, tokenAddress, decimal);
  const pair = await Fetcher.fetchPairData(DAI, WETH[DAI.chainId]);
  const route = new Route([pair], WETH[DAI.chainId]);

  try {
    let tokenAmount = new TokenAmount(WETH[DAI.chainId], "1000000000000000000");

    const trade = new Trade(route, tokenAmount, TradeType.EXACT_INPUT);

    return trade.executionPrice.toSignificant(6);
  } catch (err) {
    console.log("exception");
    console.log(err);
  }
};
