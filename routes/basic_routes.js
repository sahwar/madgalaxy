var express = require('express');
var router = express.Router();
var debug = require('debug')('router:basic');


//Standard convention for api callback - page, variables(if applicable), callback function

/**-----------------------------------------------------------------------------------------
    Variable validation
 -----------------------------------------------------------------------------------------*/
router.use(function (req, res, next) {
    next();
});
router.get('', function (req, res, next){
    res.json({'200':'You have reached madgalaxy.io - api is available at /api/v1/'});
});




module.exports = router;