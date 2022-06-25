const fetch = require("node-fetch");
jest.mock("node-fetch", () => jest.fn());

const checker = require("../checker");

test("getToken", async () => {
  const response = Promise.resolve({
    json: async () => {
      return { token: "mockedToken" };
    },
  });
  fetch.mockImplementation(() => response);
  const token = await checker.getToken();
  expect(token).toBe("mockedToken");
});
