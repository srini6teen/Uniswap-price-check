const { request } = require("graphql-request");
const QUERIES = require("./graphql_queries");
const BLOCKS_URL =
  "https://api.thegraph.com/subgraphs/name/blocklytics/ethereum-blocks";
const UNISWAP_V2_URL =
  "https://api.thegraph.com/subgraphs/name/ianlapham/uniswapv2";

var ethPrices = [];
var derivedETH = [];

const getPriceFromGraph = async () => {
  var today = Math.floor(Date.now() / 1000);
  var yesterday = today - 24 * 60 * 60;

  let BLOCKS_VARIABLES = {
    timestampFrom: yesterday,
    timestampTo: today,
    skipCount: 0,
    orderDirection: "desc",
    first: 1,
  };

  let endBlock = 0;

  request(BLOCKS_URL, QUERIES.getBlocksQuery(), BLOCKS_VARIABLES).then(
    async (data) => {
      endBlock = data.blocks[0].number;
      console.log(endBlock);
      let i = 0;
      BLOCKS_VARIABLES.orderDirection = "asc";
      BLOCKS_VARIABLES.first = 1000;

      while (i < endBlock) {
        try {
          let count = await getAsyncPrice(BLOCKS_VARIABLES);
          console.log(count);
          BLOCKS_VARIABLES.skipCount = count;
        } catch (e) {
          console.log(e);
        }
      }
    }
  );
};

const getAsyncPrice = async (BLOCKS_VARIABLES) => {
  try {
    return request(BLOCKS_URL, QUERIES.getBlocksQuery(), BLOCKS_VARIABLES).then(
      (data) => {
        return request(
          UNISWAP_V2_URL,
          QUERIES.pricesByTokenAddressAndBlockQuery(
            "0x0ff6ffcfda92c53f615a4a75d982f399c989366b",
            data.blocks
          )
        ).then((blocksResponse) => {
          let count = data.blocks.length();
          i = data.blocks[count - 1].number;

          var jsonObject = JSON.parse(JSON.stringify(blocksResponse));
          var response = new Map(Object.entries(jsonObject));

          for (const [key, value] of response.entries()) {
            if (value.derivedETH) {
              derivedETH.push(value.derivedETH);
            } else if (value.ethPrice) {
              ethPrices.push(value.ethPrice);
            }
          }
        });

        return count;
      }
    );
  } catch (e) {
    console.log(e);
  }
};

module.exports = {
  getPriceFromGraph,
};
