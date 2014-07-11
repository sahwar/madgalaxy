var express = require('express');
var router = express.Router();
var feedreader = require('../lib/feedreader.js');
var apiV1 = require('../lib/api_v1.js');
var pageNum = 1; // this is multiplied by 'perPage', a variable defined in api...js, to determine how many articles are skipped


//Standard convention for api callback - page, variable(if applicable), callback function

//validating all the parameters
router.use(function(req, res, next) {
  pageNum = 1; //resets the pageNum to 1 - this will be changed below if the user specifies a val below

  //validating pageNum
  if(req.query.pageNum){
      req.pageNum = req.query.pageNum;
  }
                                             //make this actually validate
  //validating searchString
  if(req.query.searchString){
      req.searchString = req.query.searchString;
  }

  next(); 
});

//request for article by id
router.get( '/api/v1/articles/id/:article_id', function(req, res, next){
  console.log('request for single article with an id of: ' + req.params.article_id);
  var articleId = req.params.article_id;
  apiV1.getArticleById(req.pageNum, articleId, function(err, post){
    if(err){
      res.send(err);
    }
    else{
      res.json(post);
    }
  });
});

//request for most recent articles
router.get( '/api/v1/articles/mostRecent', function(req, res, next){
  console.log('request for most recent articles');
  apiV1.getMostRecentArticles(req.pageNum, function(err, posts){
    if(err){
      res.send(err);
    }
    else{
      res.json(posts);
    }
  });
});

//request for untagged articles
router.get( '/api/v1/articles/tags/untagged/', function(req, res, next){
  apiV1.getUntaggedArticles(req.pageNum, function(err, posts){
    if(err){
      res.send(err);
    }
    else{
      res.json(posts);
    }
  });
});

//request for tags
router.get( '/api/v1/articles/tags/:tags', function(req, res, next){
  var paramsInArray = req.params.tags.split("+");
  console.log('request for articles categorized by tags: ' + paramsInArray);
  apiV1.getArticlesByTags(req.pageNum, paramsInArray, function(err, posts){
    if(err){
      res.send(err);
    }
    else{
      res.json(posts);
    }
  });
});

router.use('/api/v1/search/', function(req, res, next) {
  if (req.searchString){
    next();
  }else{
    console.log('ERROR - Empty searchString parameter');
    res.json({'error': 'Empty searchString parameter'});
  }
});

router.get( '/api/v1/search/', function(req, res, next){
  console.log('search for: ' + req.searchString);
  apiV1.getArticlesBySearchString(req.pageNum, req.searchString, function(err, posts){
    if(err){
      res.send(err);
    }
    else{
      res.json(posts);
    }
  });
});

module.exports = router;