const axios = require("axios");
const bodyParser = require("body-parser");
const express = require("express");
const thundra = require("@thundra/core");

const app = express();

app.use(thundra.expressMW());
app.use(bodyParser.json());

app.post("/", async ({ body: { email, number } }, response) => {
  response.end();
  const result = factorial(number);
  await axios.post("http://email:8000/", { email, number, result });
});

const f = [];
function factorial(n) {
  if (n == 0 || n == 1) return 1;
  if (f[n] > 0) return f[n];
  return (f[n] = factorial(n - 1) * n);
}

app.listen(8000);
