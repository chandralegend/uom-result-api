"use strict";

const get_results = require("./result_scraper");

exports.testGet = function (req, res) {
  res.send(req.body);
};

exports.getResults = async function (req, res) {
  console.log(req.body);
  const results = await get_results(req.body).catch((e) => {
    res.send("Error in the Scraping Process");
  });
  res.json(results);
};
