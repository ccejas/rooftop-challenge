const dotenv = require("dotenv");
dotenv.config();

const fetch = require("node-fetch");

async function get(url) {
  const response = await fetch(url);
  return response.json();
}

function getTokenEndpoint() {
  return `${process.env.BASE_URL}/token?email=${process.env.USER_MAIL}`;
}

function getBlocksEndpoint(token) {
  return `${process.env.BASE_URL}/blocks?token=${token}`;
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

async function getNextBlock(currentBlock, blocks, token) {
  console.info("searching next ordered block...");
  for (let index = 1; index < blocks.length; index++) {
    if (currentBlock === blocks[index]) continue; //ignore comparison with itself
    if (await areConsecutiveBlocks(currentBlock, blocks[index], token)) {
      console.info("found it!");
      return blocks[index];
    }
  }
  return null;
}

async function isBlocksOrderOk(data, token) {
  const response = await post(getCheckBlocksEndpoint(token), {
    encoded: data,
  });
  return response.message;
}

exports.getToken = async () => {
  const response = await get(getTokenEndpoint());
  return response.token;
};

exports.getBlocks = async (token) => {
  const response = await get(getBlocksEndpoint(token));
  return response.data;
};

exports.check = async (blocks, token) => {
  console.group();
  const result = [blocks[0]]; //By definition the first item is in the correct position
  do {
    const orderedTokensLength = result.length;
    const nextBlock = await getNextBlock(
      result[orderedTokensLength - 1],
      blocks,
      token
    );
    if (!nextBlock) throw `Next block can not be found!`;
    result.push(nextBlock);
  } while (result.length !== blocks.length);
  console.groupEnd();
  return result;
};

exports.checkOrder = async (blocks, token) => {
  return isBlocksOrderOk(blocks.join(""), token);
};
