const puppeteer = require("puppeteer");
const fs = require("fs").promises;

// logins to the lms.mrt.ac.lk and go to results page
async function login(username, password, page) {
  await page.goto("https://lms.mrt.ac.lk/login_index.php");
  const inputs = await page.$$("input");
  let usernameInput = inputs[0];
  let passwordInput = inputs[1];
  let submitBtn = inputs[2];
  await usernameInput.type(username);
  await passwordInput.type(password);
  await submitBtn.click();
  await page.waitForTimeout(500);
  await page.goto("https://lms.mrt.ac.lk/mis_exam/reports/view_my_results.php");
}

//scrapes the results
async function scrapeResults(page) {
  let result = [];
  let resultsTable = await page.$(".Text_table");
  let tableRows = await resultsTable.$$("tr");
  let semester = { semesterName: "", results: [] };
  for (const tr of tableRows) {
    const semesterRow = await tr.$(".Text_table_head");
    let haveBgColor = await page.evaluate(
      (el) => el.getAttribute("bgcolor"),
      tr
    );
    if (semesterRow) {
      semester = { semesterName: "", results: [] };
      result.push(semester);
      const semesterName = await (
        await semesterRow.getProperty("textContent")
      ).jsonValue();
      semester.semesterName = semesterName;
    } else if (!haveBgColor) {
      let columns = await tr.$$("td");
      let module = {
        moduleCode: "",
        moduleName: "",
        isGPA: false,
        credits: 0,
        grade: "",
      };
      if (columns.length > 1) {
        module.moduleCode = await (
          await columns[0].getProperty("innerText")
        ).jsonValue();
        module.moduleName = await (
          await columns[1].getProperty("innerText")
        ).jsonValue();
        module.grade = await (
          await columns[2].getProperty("innerText")
        ).jsonValue();

        let gpa = await (await columns[3].getProperty("innerText")).jsonValue();
        let nonGPA = await (
          await columns[4].getProperty("innerText")
        ).jsonValue();

        module.isGPA = gpa === "-" ? false : true;
        module.credits = gpa === "-" ? parseFloat(nonGPA) : parseFloat(gpa);

        semester.results.push(module);
      }
    }
  }
  return result;
}

const getResults = async (username, password) => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await login(username, password, page);
  results = await scrapeResults(page);
  //await fs.writeFile("./results.json", JSON.stringify(results, null, 2)); //saves the results to a json
  await browser.close();
  
  return results;
};

module.exports = async function (jsonData) {
  results = await getResults(jsonData.username, jsonData.password);
  return results;
};
