var express = require('express');
var router = express.Router();
var feedreader = require('../lib/feedreader.js');
var apiV1 = require('../lib/api_v1.js');
var pageNum = 1; // this is multiplied by 'perPage', a variable defined in api...js, to determine how many articles are skipped


//Standard convention for api callback - page, variables(if applicable), callback function

/**-----------------------------------------------------------------------------------------
    Variable validation
 -----------------------------------------------------------------------------------------*/
router.use(function (req, res, next) {
    pageNum = 1; //resets the pageNum to 1 - this will be changed below if the user specifies a val below

    //validating pageNum
    if (req.query.pageNum) {
        req.pageNum = req.query.pageNum;
    }
    //make this actually validate
    //validating searchString
    if (req.query.searchString) {
        req.searchString = req.query.searchString;
    }
    //make this actually validate
    //validating searchString
    if (req.query.searchTag) {
        req.searchTag = req.query.searchTag;
    }

    next();
});

/**-----------------------------------------------------------------------------------------
    GET article by id
 -----------------------------------------------------------------------------------------*/
router.get('/api/v1/articles/id/:article_id', function (req, res, next) {
    console.log('request for single article with an id of: ' + req.params.article_id);
    var articleId = req.params.article_id;
    apiV1.getArticleById(req.pageNum, articleId, function (err, post) {
        if (err) {
            res.send(err);
        } else {
            res.json(post);
        }
    });
});

/**-----------------------------------------------------------------------------------------
    GET untagged articles
 -----------------------------------------------------------------------------------------*/
router.get('/api/v1/articles/tags/untagged', function (req, res, next) {
    apiV1.getUntaggedArticles(req.pageNum, function (err, posts) {
        if (err) {
            res.send(err);
        } else {
            res.json(posts);
        }
    });
});

/**-----------------------------------------------------------------------------------------
    GET articles by tags
 -----------------------------------------------------------------------------------------*/
router.get('/api/v1/articles/tags/:tags', function (req, res, next) {
    var paramsInArray = req.params.tags.split("+");
    console.log('request for articles categorized by tags: ' + paramsInArray);
    apiV1.getArticlesByTags(req.pageNum, paramsInArray, function (err, posts) {
        if (err) {
            res.send(err);
        } else {
            res.json(posts);
        }
    });
});


/**-----------------------------------------------------------------------------------------
    REST tags
 -----------------------------------------------------------------------------------------*/
router.route('/api/v1/tags')
    //GET current tags
    .get(function (req, res, next) {
        console.log('request for most recent tags');
        apiV1.getCurrentTags(req.pageNum, function (err, tags) {
            if (err) {
                res.send(err);
            } else {
                res.json(tags);
            }
        });
    })

    .all(function (req, res, next) {
        if(req.body.tag){
            req.tag = req.body.tag;
            next();
        }
        else{
            res.json({'error':'required parameter: tag - was not set'});
        }
    })

    //DELETE a tag
    .delete(function (req, res, next) {
        console.log('request to delete tag: ' + req.body.tag);
        apiV1.deleteTag(req.pageNum, req.tag, function (err, tags) {
            if (err) {
                res.send(err);
            } else {
                res.json(tags);
            }
        });
    })

    .all(function (req, res, next) {
        if(req.body.tag_varients){
            req.tag_varients = req.body.tag_varients;
            next();
        }
        else{
            res.json({'error':'required parameter: tag_varients - was not set'});
        }
    })

    //PUT a tag
    .put(function (req, res, next) {
        console.log('request to add tag: ' + req.tag + ' : ' + req.tag_varients);
        var tag_to_add = new Object();
        tag_to_add.first_level = req.tag;
        tag_to_add.second_level = req.tag_varients.split("+");
        apiV1.addTag(req.pageNum, tag_to_add, function (err, tags) {
            if (err) {
                res.send(err);
            } else {
                res.json(tags);
            }
        });
    });


/**-----------------------------------------------------------------------------------------
    GET articles
 -----------------------------------------------------------------------------------------*/
router.get('/api/v1/articles', function (req, res, next) {
    console.log('request for most recent articles');
    apiV1.getMostRecentArticles(req.pageNum, function (err, posts) {
        if (err) {
            res.send(err);
        } else {
            res.json(posts);
        }
    });
});



/**-----------------------------------------------------------------------------------------
    SearchString validation
 -----------------------------------------------------------------------------------------*/
router.use('/api/v1/search/', function (req, res, next) {
    if (req.searchString) {
        next();
    } else {
        console.log('ERROR - Empty searchString parameter');
        res.json({
            'error': 'Empty searchString parameter'
        });
    }
});

/**-----------------------------------------------------------------------------------------
    GET search results
 -----------------------------------------------------------------------------------------*/
router.get('/api/v1/search/', function (req, res, next) {
    console.log('search for: ' + req.searchString + req.pageNum);
    apiV1.getArticlesBySearchString(req.pageNum, req.searchString, req.query.searchTag, function (err, posts) {
        if (err) {
            res.send(err);
        } else {
            res.json(posts);
        }
    });
});


module.exports = router;