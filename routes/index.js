var express = require('express');
var router = express.Router();
var feedreader = require('../lib/feedreader.js');
var apiV1 = require('../lib/api_v1.js');

//request for single article
router.get( '/api/v1/articles/id/*', function(req, res, next){
  console.log('request for single article');
  var articleId = req.params[0];
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