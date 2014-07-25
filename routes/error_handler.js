var express = require('express');
var router = express.Router();
var debug = require('debug')('router:error_handler');


//catch 404 and forwarding to error handler
router.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

router.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.json({
        'error': err.message
    });
});

module.exports = router;