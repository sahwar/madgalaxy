var express = require('express');
var router = express.Router();
var feedreader = require('../lib/feedreader.js');
var apiV1 = require('../lib/api_v1.js');
var pageNum = 1; // this is multiplied by 'perPage', a variable defined in api...js, to determine how many articles are skipped
var debug = require('debug')('router:api_v1');


//Standard convention for api callback - page, variables(if applicable), callback(err, result)

/**-----------------------------------------------------------------------------------------
    Variable validation
 -----------------------------------------------------------------------------------------*/
router.use(function (req, res, next) {
    pageNum = 1; //resets the pageNum to 1 - this will be changed below if the user specifies a val below

    //validating pageNum
    if (req.query.pageNum) {
        req.pageNum = req.query.pageNum;
    }
    //validating searchString
    if (req.query.searchString) {
        req.searchString = req.query.searchString;
    }
    //validating searchString
    if (req.query.searchTag) {
        req.searchTag = req.query.searchTag;
    }

    next();
});

/**-----------------------------------------------------------------------------------------
    Add a tag to an article
 -----------------------------------------------------------------------------------------*/
router.post('/articles/id/:article_id/addTag', function (req, res, next) {
    debug('request to add tag: ' + req.body.tag);
    var articleId = req.params.article_id;
    apiV1.addUserTagToArticle(req.pageNum, articleId, req.body.tag, function (err, post) {
        if (err) {
            res.send(err);
        } else {
            res.json(post);
        }
    });
});

/**-----------------------------------------------------------------------------------------
    DELETE a tag from an article
 -----------------------------------------------------------------------------------------*/
router.delete('/articles/id/:article_id/removeTag', function (req, res, next) {
    debug('request for single article with an id of: ' + req.params.article_id);
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
    GET article by id
 -----------------------------------------------------------------------------------------*/
router.get('/articles/id/:article_id', function (req, res, next) {
    debug('request for single article with an id of: ' + req.params.article_id);
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
router.get('/articles/tags/untagged', function (req, res, next) {
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
router.get('/articles/tags/:tags', function (req, res, next) {
    var paramsInArray = req.params.tags.split("+");
    debug('request for articles categorized by tags: ' + paramsInArray);
    apiV1.getArticlesByTags(req.pageNum, paramsInArray, function (err, posts) {
        if (err) {
            res.send(err);
        } else {
            res.json(posts);
        }
    });
});

/**-----------------------------------------------------------------------------------------
    GET articles
 -----------------------------------------------------------------------------------------*/
router.get('/articles', function (req, res, next) {
    debug('request for most recent articles');
    apiV1.getMostRecentArticles(req.pageNum, function (err, posts) {
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
router.route('/tags')
//GET current tags
.get(function (req, res, next) {
    debug('request for most recent tags');
    apiV1.getCurrentTags(req.pageNum, function (err, tags) {
        if (err) {
            res.send(err);
        } else {
            res.json(tags);
        }
    });
})

.all(function (req, res, next) {
    if (req.body.tag) {
        req.tag = req.body.tag;
        next();
    } else {
        res.json({
            'error': 'required parameter: tag - was not set'
        });
    }
})

//DELETE a tag
.delete(function (req, res, next) {
    debug('request to delete tag: ' + req.body.tag);
    apiV1.deleteTag(req.pageNum, req.tag, function (err, tags) {
        if (err) {
            res.send(err);
        } else {
            res.json(tags);
        }
    });
})

.all(function (req, res, next) {
    if (req.body.tag_varients) {
        req.tag_varients = req.body.tag_varients;
        next();
    } else {
        res.json({
            'error': 'required parameter: tag_varients - was not set'
        });
    }
})

//POST a tag
.post(function (req, res, next) {
    debug('request to add tag: ' + req.tag + ' : ' + req.tag_varients);
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
    GET search results
 -----------------------------------------------------------------------------------------*/
router.route('/search')
//validates search string
.all(function (req, res, next) {
    if (req.searchString) {
        next();
    } else {
        debug('ERROR - Empty searchString parameter');
        res.json({
            'error': 'Empty searchString parameter'
        });
    }
})

.get(function (req, res, next) {
    debug('search for: ' + req.searchString + req.pageNum);
    apiV1.getArticlesBySearchString(req.pageNum, req.searchString, req.query.searchTag, function (err, posts) {
        if (err) {
            res.send(err);
        } else {
            res.json(posts);
        }
    });
});


module.exports = router;