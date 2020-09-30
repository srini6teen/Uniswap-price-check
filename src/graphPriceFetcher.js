const { request } = require("graphql-request");
const QUERIES = require("./graphql_queries");
const BLOCKS_URL =
  "https://api.thegraph.com/subgraphs/name/blocklytics/ethereum-blocks";
const UNISWAP_V2_URL =
  "https://api.thegraph.com/subgraphs/name/ianlapham/uniswapv2";

var ethPrices = [];
var derivedETH = [];

let minDerivedETH = 0;
let maxDerivedETH = 0;
let minETHPrice = 0;
let maxETHPrice = 0;

const getPriceFromGraph = async () => {
  var today = Math.floor(Date.now() / 1000);
  var yesterday = today - 1 * 60 * 60;

  let BLOCKS_VARIABLES = {
    timestampFrom: yesterday,
    timestampTo: today,
    skipCount: 0,
    orderDirection: "desc",
    first: 1,
  };

  let endBlock = 0;

  return request(BLOCKS_URL, QUERIES.getBlocksQuery(), BLOCKS_VARIABLES)
    .then(async (data) => {
      endBlock = data.blocks[0].number;

      let i = 0;
      BLOCKS_VARIABLES.orderDirection = "asc";
      BLOCKS_VARIABLES.first = 100;

      while (i < endBlock) {
        try {
          result = await getAsyncPrice(BLOCKS_VARIABLES);
          i = result.i;
          BLOCKS_VARIABLES.skipCount += result.skipCount;
        } catch (e) {
          console.log(e);
        }
      }
    })
    .then(() => {
      return {
        minDerivedETH: minDerivedETH,
        maxDerivedETH: maxDerivedETH,
        minETHPrice: minETHPrice,
        maxETHPrice: maxETHPrice,
      };
    });
};

const getAsyncPrice = async (BLOCKS_VARIABLES) => {
  let i = 0;
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
          var jsonObject = JSON.parse(JSON.stringify(blocksResponse));
          var response = new Map(Object.entries(jsonObject));

          for (const [key, value] of response.entries()) {
            if (value.derivedETH) {
              if (minDerivedETH == 0 || value.derivedETH < minDerivedETH) {
                minDerivedETH = value.derivedETH;
                let minKey = key.replace("t", "b");
                minETHPrice = response.get(minKey).ethPrice;
              }
              if (value.derivedETH > maxDerivedETH) {
                maxDerivedETH = value.derivedETH;
                let maxKey = key.replace("t", "b");
                maxETHPrice = response.get(maxKey).ethPrice;
              }
            }
          }

          let count = data.blocks.length;
          i = data.blocks[count - 1].number;
          return { skipCount: count, i: i };
        });
      }
    );
  } catch (e) {
    console.log(e);
  }
};

module.exports = {
  getPriceFromGraph,
};
