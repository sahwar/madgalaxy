var express = require('express');
var router = express.Router();
var feedreader = require('../lib/feedreader.js');
var apiV1 = require('../lib/api_v1.js');
var pageNum = 1;
// route middleware that will happen on every request

//this is for later when adding in pagination to planet sites
router.use(function(req, res, next) {
  if (req.query.pageNum){
    pageNum = req.query.pageNum;
  }else{
    pageNum = 1;
  }
  next(); 
});

//request for article by id
router.get( '/api/v1/articles/id/:article_id', function(req, res, next){
  console.log('request for single article with an id of: ' + req.params.article_id);
  var articleId = req.params.article_id;
  apiV1.getArticleById(articleId, function(err, post){
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
  apiV1.getMostRecentArticles(function(err, posts){
    if(err){
      res.send(err);
    }
    else{
      res.json(posts);
    }
  });
});

//request for tags
router.get( '/api/v1/articles/:tags', function(req, res, next){
  var paramsInArray = req.params.tags.split("+");
  console.log('request for articles categorized by tags: ' + paramsInArray);
  apiV1.getArticlesByTags(paramsInArray, function(err, posts){
    if(err){
      res.send(err);
    }
    else{
      res.json(posts);
    }
  });
});

router.use('/api/v1/search/', function(req, res, next) {
  if (req.query.searchString){
    next();
  }else{
    console.log('ERROR - Empty searchString parameter');
    res.json({'error': 'Empty searchString parameter'});
  }
});

router.get( '/api/v1/search/', function(req, res, next){
  var searchString = req.query.searchString;
  console.log('search for: ' + searchString);
  apiV1.getArticlesBySearchString(searchString, function(err, posts){
    if(err){
      res.send(err);
    }
    else{
      res.json(posts);
    }
  });
});

module.exports = router;