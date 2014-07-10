var express = require('express');
var router = express.Router();
var feedreader = require('../lib/feedreader.js');
var apiV1 = require('../lib/api_v1.js');
var pageNum = 1;
// route middleware that will happen on every request
router.use(function(req, res, next) {
  if (req.query.pageNum){
    pageNum = req.query.pageNum;
  }else{
    pageNum = 1;
  }
  console.log(pageNum);
  next(); 
});

//request for single article
router.get( '/api/v1/articles/id/:article_id', function(req, res, next){
  console.log('request for single article');
  var articleId = req.params.article_id;
  console.log(articleId);
  apiV1.getArticleById(articleId, function(err, post){
    if(err){
      res.send(err);
    }
    else{
      res.json(post);
    }
  });
});

router.get( '/api/v1/articles/mostRecent', function(req, res, next){
  apiV1.getMostRecentArticles(function(err, posts){
    if(err){
      res.send(err);
    }
    else{
      res.json(posts);
    }
  });
});

//the route for tags
router.get( '/api/v1/articles/*', function(req, res, next){
  console.log('request for tag');
  var paramsInArray = req.params[0].split("+");
  console.log(paramsInArray);
  apiV1.getArticlesByTags(paramsInArray, function(err, posts){
    if(err){
      res.send(err);
    }
    else{
      res.json(posts);
    }
  });
});

router.get( '/api/v1/search/*', function(req, res){
  var searchString = req.query.searchString;
  console.log('the user made a search for: ' + searchString);
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