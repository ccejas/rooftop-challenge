const fetch = require("node-fetch");
jest.mock("node-fetch", () => jest.fn());

const checker = require("../checker");

const blocksData = ["block1", "block3", "block5", "block6", "block2", "block4"];

function buildResponse(obj) {
  return Promise.resolve({
    json: async () => {
      return obj;
    },
  });
}

test("getToken", async () => {
  //   const response = Promise.resolve({
  //     json: async () => {
  //       return { token: "mockedToken" };
  //     },
  //   });
  const response = buildResponse({ token: "mockedToken" });
  fetch.mockImplementation(() => response);
  const token = await checker.getToken();
  expect(token).toBe("mockedToken");
});

test("check", async () => {
  const responseTrue = buildResponse({ message: true });
  const responseFalse = buildResponse({ message: false });
  fetch.mockImplementation((url, options) => {
    const body = JSON.parse(options.body).blocks;
    if (body[0] === "block1" && body[1] === "block2") return responseTrue;
    if (body[0] === "block2" && body[1] === "block3") return responseTrue;
    if (body[0] === "block3" && body[1] === "block4") return responseTrue;
    if (body[0] === "block4" && body[1] === "block5") return responseTrue;
    if (body[0] === "block5" && body[1] === "block6") return responseTrue;
    return responseFalse;
  });
  const orderedBlocks = await checker.check(blocksData, "token");
  expect(orderedBlocks).toEqual(blocksData.sort());
});

test("getBlocks", async () => {
  const response = buildResponse({ data: blocksData });
  fetch.mockImplementation(() => response);
  const blocks = await checker.getBlocks();
  console.log(blocks);
  expect(blocks).toEqual(blocksData);
});
