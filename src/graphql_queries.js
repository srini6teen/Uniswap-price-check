const { gql } = require('graphql-request');

const getBlocksQuery = () => {
    let queryString = gql `query blocks($timestampFrom: Int!, $timestampTo: Int!) {
        blocks(
            orderBy: timestamp
            orderDirection: asc
            where: { timestamp_gt: $timestampFrom, timestamp_lt: $timestampTo }
        ) {
            id
            number
            timestamp
            __typename
        }
    }`
    return queryString
  }

  const pricesByTokenAddressAndBlockQuery = (tokenAddress, blocks) => {
    //console.log(blocks);
    let queryString = gql `query blocks { `
    queryString += blocks.map(
      block => `
        t${block.timestamp}:token(id:"${tokenAddress}", block: { number: ${block.number} }) {
          derivedETH
        }
      `
    );
    queryString += ',';
    queryString += blocks.map(
      block => `
        b${block.timestamp}: bundle(id:"1", block: { number: ${block.number} }) {
          ethPrice
        }
      `
    );

    queryString += '}';
    console.log("Query String:: " + queryString)
    return queryString;
  }

  module.exports = {
    getBlocksQuery,
    pricesByTokenAddressAndBlockQuery,
  }
