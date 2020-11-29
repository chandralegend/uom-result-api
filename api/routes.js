'use strict';
module.exports = function(app) {
  var scrapeController = require('./controllers/scrapeController');

  app.route('/results')
    .get(scrapeController.getResults)
};