const {
  Builder,
  Browser,
  By,
  Key,
  until,
  Select,
} = require("selenium-webdriver");
const Chrome = require("selenium-webdriver/chrome");
// import {
//   scratch_score_game,
//   scratch_score_total,
//   handicap_total,
//   final_score_total,
// } from "./metrics";

async function collectMetrics() {
  await scrapeData();
  console.log(`Metrics refreshed!`);
}

async function scrapeData() {
  const options = new Chrome.Options();
  let driver = await new Builder()
    .forBrowser("chrome")
    .setChromeOptions(options.addArguments("--headless=new"))
    .build();
  try {
    let listOfYearOptions = await getYearOptions(driver);
    console.log(listOfYearOptions);
    for (let yearIndex in listOfYearOptions) {
      let listOfBowlerOptions = await getBowlerOptions(
        driver,
        listOfYearOptions[yearIndex]
      );
      console.log(listOfBowlerOptions);
      for (let bowlerIndex in listOfBowlerOptions) {
        let bowlerScores = await getBowlerScores(
          driver,
          listOfYearOptions[yearIndex],
          listOfBowlerOptions[bowlerIndex]
        );
        console.log(
          `Year: ${listOfYearOptions[yearIndex]}, Bowler: ${listOfBowlerOptions[bowlerIndex]}, Scores: ${bowlerScores}`
        );
      }
    }
  } catch (e) {
    console.error(`ERROR: ${e}`);
  } finally {
    console.log("CLOSING WEBDRIVER");
    await driver.quit();
  }
}

async function getYearOptions(driver) {
  const responsePromise = new Promise(async (resolve, reject) => {
    let yearOptions = [];
    try {
      await driver.get(
        "https://www.leaguesecretary.com/bowling-centers/rossmere-laneswinnipeg-manitoba/bowling-leagues/challengers/bowler-info/first-bowler/2018/fall/108372/0"
      );
      let yearSelectElement = await driver.wait(
        until.elementLocated(
          By.xpath(
            `//*[@id="ctl00_MainContent_BowlerHistoryGrid1_rddSeasonYear"]/select`
          )
        ),
        10000
      );
      const yearSelect = new Select(yearSelectElement);
      const yearOptionElement = await yearSelect.getOptions();
      for (const index in yearOptionElement) {
        let text = await yearOptionElement[index].getText();
        text = text.substring(5);
        yearOptions.push(text);
      }
    } catch (e) {
      reject(e);
    }
    resolve(yearOptions);
  });
  return responsePromise;
}

async function getBowlerOptions(driver, year) {
  let responsePromise = new Promise(async (resolve, reject) => {
    let bowlerOptions = [];
    try {
      await driver.get(
        `https://www.leaguesecretary.com/bowling-centers/rossmere-laneswinnipeg-manitoba/bowling-leagues/challengers/bowler-info/first-bowler/${year}/fall/108372/0`
      );
      let bowlerSelectElement = await driver.wait(
        until.elementLocated(
          By.xpath(
            `//*[@id="ctl00_MainContent_BowlerHistoryGrid1_rddBowler"]/select`
          )
        ),
        10000
      );
      const bowlerSelect = new Select(bowlerSelectElement);
      const bowlerOptionElement = await bowlerSelect.getOptions();
      for (const index in bowlerOptionElement) {
        let bowlerOption =
          await bowlerOptionElement[index].getAttribute("value");
        bowlerOptions.push(bowlerOption);
      }
    } catch (e) {
      reject(e);
    }
    resolve(bowlerOptions);
  });
  return responsePromise;
}

async function getBowlerScores(driver, year, bowlerID) {
  let responsePromise = new Promise(async (resolve, reject) => {
    let bowlerScores = [];
    try {
      await driver.get(
        `https://www.leaguesecretary.com/bowling-centers/rossmere-laneswinnipeg-manitoba/bowling-leagues/challengers/bowler-info/first-bowler/${year}/fall/108372/${bowlerID}`
      );
      let scoresTableElement = await driver.wait(
        until.elementLocated(
          By.id(`ctl00_MainContent_BowlerHistoryGrid1_RadGrid1_ctl00`)
        ),
        10000
      );
      let scoresTableBodyElement = await scoresTableElement.findElement(
        By.css(`tbody`)
      );
      let scoresTableRowElements = await scoresTableBodyElement.findElement(
        By.css(`tr`)
      );
    } catch (e) {
      reject(e);
    }
    resolve(bowlerScores);
  });
  return responsePromise;
}

module.exports = { collectMetrics };
