const dotenv = require("dotenv");
dotenv.config();

const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

function getTokenEndpoint() {
  return `${process.env.BASE_URL}/token?email=${process.env.USER_MAIL}`;
}

async function getToken() {
  const response = await fetch(getTokenEndpoint());
  const body = await response.json();
  return body.token;
}

function getBlocksEndpoint(token) {
  return `${process.env.BASE_URL}/blocks?token=${token}`;
}

async function getBlocks(token) {
  const response = await fetch(getBlocksEndpoint(token));
  const body = await response.json();
  return body.data;
}

async function main() {
  const token = await getToken();
  console.log("TOKEN:", token);

  const blocks = await getBlocks(token);
  console.log("BLOCKS:", blocks);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
