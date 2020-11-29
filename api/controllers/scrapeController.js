"use strict";

const get_results = require("./result_scraper");

exports.testGet = function (req, res) {
  res.send(req.params);
};

exports.getResults = async function (req, res) {
    const results = await get_results(req.body)
    res.json(results);
  };