const dotenv = require("dotenv");
dotenv.config();

const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

async function get(url) {
  const response = await fetch(url);
  return response.json();
}

function getTokenEndpoint() {
  return `${process.env.BASE_URL}/token?email=${process.env.USER_MAIL}`;
}

async function getToken() {
  const response = await get(getTokenEndpoint());
  return response.token;
}

function getBlocksEndpoint(token) {
  return `${process.env.BASE_URL}/blocks?token=${token}`;
}

async function getBlocks(token) {
  const response = await get(getBlocksEndpoint(token));
  return response.data;
}

function getCheckBlocksEndpoint(token) {
  return `${process.env.BASE_URL}/check?token=${token}`;
}

async function post(url, body) {
  const response = await fetch(url, {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
  return response.json();
}

async function areConsecutiveBlocks(block1, block2, token) {
  const response = await post(getCheckBlocksEndpoint(token), {
    blocks: [block1, block2],
  });
  return response.message;
}

async function check(blocks, token) {
  console.group();
  const result = [blocks[0]];
  do {
    const orderedTokensLength = result.length;
    console.info("searching next ordered block...");
    for (let index = 1; index < blocks.length; index++) {
      if (
        await areConsecutiveBlocks(
          result[orderedTokensLength - 1],
          blocks[index],
          token
        )
      ) {
        result.push(blocks[index]);
        console.info("found it!");
        break;
      }
    }
    if (orderedTokensLength === result.length) throw `Blocks can't be ordered!`;
  } while (result.length !== blocks.length);
  console.groupEnd();
  return result;
}

async function isBlocksOrderOk(data, token) {
  const response = await post(getCheckBlocksEndpoint(token), {
    encoded: data,
  });
  return response.message;
}

async function checkOrder(blocks, token) {
  return isBlocksOrderOk(blocks.join(""), token);
}

async function main() {
  const token = await getToken();
  console.log("TOKEN:", token);

  const blocks = await getBlocks(token);
  console.log("BLOCKS:", blocks);

  const sortedBlocks = await check(blocks, token);
  console.log("SORTED BLOCKS:");
  console.table(sortedBlocks);

  const isCorrectOrder = await checkOrder(sortedBlocks, token);
  console.log("CORRECT ORDER:", isCorrectOrder);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
