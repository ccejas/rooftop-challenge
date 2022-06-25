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

async function main() {
  const token = await getToken();
  console.log("TOKEN:", token);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
