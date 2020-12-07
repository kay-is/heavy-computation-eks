const axios = require("axios");
const bodyParser = require("body-parser");
const express = require("express");
const thundra = require("@thundra/core");

const app = express();

app.use(thundra.expressMW());
app.use(bodyParser.json());

app.post("/", async ({ body: { email, number } }, response) => {
  response.end(JSON.stringify({ email, number }));
  await axios.post(
    "http://calculator:8000/",
    { email, number },
    { timeout: 3000 }
  );
  await axios.post("http://error:8000/", { email, number }, { timeout: 3000 });
});

app.listen(8000);
