const promClient = require("prom-client");
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const express = require("express");
const app = express();
const port = 9996;
const { scratch_score_total } = require("./metrics");
// const { collectMetrics } = require("./DataScraper");

const collectDefaultMetrics = promClient.collectDefaultMetrics;

collectDefaultMetrics();

app.get("/metrics", async (req, res) => {
  console.log("Scraped");
  res.send(await promClient.register.metrics());
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

const promise_spawn = (arg1, arg2) => {
  return new Promise((resolve) => {
    const process = spawn(arg1, arg2);
    process.on("close", (code) => {
      console.log(`Python script complete. Code: ${code}`);
      resolve();
    });
  });
};

const getJsonDataFromPython = (readPath) => {
  const jsonFiles = fs
    .readdirSync(readPath)
    .filter((file) => path.extname(file) === ".json");
  if (jsonFiles.length === 0) return [];
  return jsonFiles.map((fileName) => {
    const fileData = fs.readFileSync(path.join(readPath, fileName));
    let json = JSON.parse(fileData.toString());
    let name = fileName.substring(0, fileName.indexOf("_"));
    let year = fileName.substring(
      fileName.indexOf("_") + 1,
      fileName.indexOf(".")
    );
    return { name: name, year: year, data: [...json] };
  });
};

const collectMetrics = async () => {
  let start = Date.now();
  await promise_spawn("python", ["main.py"]);
  const allBowlersHistoryJson = getJsonDataFromPython("./bowler_history");
  allBowlersHistoryJson.forEach((bowlerHistory) => {
    // console.log(bowlerHistory);
    bowlerHistory.data.forEach((dataForTheWeek) => {
      try {
        scratch_score_total.set(
          {
            name: bowlerHistory.name,
            year: bowlerHistory.year,
            week: dataForTheWeek["Week"],
          },
          dataForTheWeek["SS"]
        );
      } catch (e) {
        console.error("ENCOUNTERED ERROR: ", e);
      }
    });
  });

  let timeTaken = Date.now() - start;
  console.log(
    "Total time taken to collectMetrics: " + timeTaken + " milliseconds"
  );
};

setInterval(
  () => {
    collectMetrics();
  },
  1440 * 60 * 1000
  // This number is equal to 1 day
);

collectMetrics();
