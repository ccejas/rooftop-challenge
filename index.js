const checker = require("./checker");

async function main() {
  const token = await checker.getToken();
  console.log("TOKEN:", token);

  const blocks = await checker.getBlocks(token);
  console.log("BLOCKS:", blocks);

  const sortedBlocks = await checker.check(blocks, token);
  console.log("SORTED BLOCKS:");
  console.table(sortedBlocks);

  const isCorrectOrder = await checker.checkOrder(sortedBlocks, token);
  console.log("CORRECT ORDER:", isCorrectOrder);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
