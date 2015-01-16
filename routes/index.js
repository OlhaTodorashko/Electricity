var express = require('express'),
    router = express.Router(),
    loader = require('../bin/loader');

/* GET home page. */
router.get('/', function (req, res) {
  res.render('index', { title: 'Electricity dashboard '});
});

router.get('/loadData', function (req, res) {
  var loadData = loader.getData(req.query.date);
  loadData.pipe(res);
});
module.exports = router;
