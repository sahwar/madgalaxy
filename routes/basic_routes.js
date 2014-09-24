var express = require('express');
var router = express.Router();
var debug = require('debug')('router:basic');


router.use(function (req, res, next) {
    next();
});
router.get('', function (req, res, next){ //this route is for www.madglalaxy.io/
    res.json({'200':'You have reached madgalaxy.io - api is available at /api/v1/ - documentation at: https://github.com/madglory/madgalaxy'});
});





module.exports = router;