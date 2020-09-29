const { request } = require('graphql-request');
const QUERIES = require('./graphql_queries');
const BLOCKS_URL = 'https://api.thegraph.com/subgraphs/name/blocklytics/ethereum-blocks';
const UNISWAP_V2_URL = 'https://api.thegraph.com/subgraphs/name/ianlapham/uniswapv2';


const getPriceFromGraph = async () => {

    var today = Math.floor(Date.now() /1000);
    var yesterday = today - (24 * 60 * 60);

    const BLOCKS_VARIABLES = {
        timestampFrom: yesterday,
        timestampTo: today
    }

    return request(BLOCKS_URL, QUERIES.getBlocksQuery(), BLOCKS_VARIABLES).then((data) => {
        return request(UNISWAP_V2_URL, QUERIES.pricesByTokenAddressAndBlockQuery("0x0ff6ffcfda92c53f615a4a75d982f399c989366b", data.blocks)).then((blocksResponse) => {
            console.log(blocksResponse);
            var jsonObject = JSON.parse(JSON.stringify(blocksResponse));
            var response = new Map(Object.entries(jsonObject));
            var ethPrices = [];
            var derivedETH = [];
            for (const [key, value] of response.entries()) {
                if (value.derivedETH) {
                    derivedETH.push(value.derivedETH);
                } else if (value.ethPrice) {
                    ethPrices.push(value.ethPrice);
                }

            }
            return derivedETH.map(v => 1/v);
        });
    });
  };

  module.exports = {
    getPriceFromGraph
  }