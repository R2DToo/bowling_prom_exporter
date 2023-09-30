const promClient = require("prom-client");
const express = require("express");
const app = express();
const port = 9996;
const { collectMetrics } = require("./DataScraper");

promClient.collectDefaultMetrics();

setInterval(
  () => {
    collectMetrics();
  },
  1440 * 60 * 1000
  // This number is equal to 1 day
);

collectMetrics();

app.get("/metrics", (req, res) => {
  console.log("Scraped");
  res.send(promClient.register.metrics());
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
