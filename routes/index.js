var express = require('express');
var router = express.Router();
var feedreader = require('../lib/feedreader.js');
var apiV1 = require('../lib/api_v1.js');
var pageNum = 1;
// var perPage = 10; this is defined in api... .js


//Standard convention for api callback - page, variable(if applicable), callback function

//
router.use(function(req, res, next) {
  pageNum = 1; //resets the pageNum to 1 - this will be changed below with router.param('pageNum') if the user specifies a val
  next(); 
});

//validates the parameter pageNum
router.param('tags', function(req, res, next, pageNum){
  console.log('seeing if pageNum is valid');
  if (typeof(req.query.pageNum) === "number"){
    pageNum = req.query.pageNum;
    next();
  }else{
    res.json({'error': 'Not a valid pageNum value'});
  }
});

// //validates the parameter searchString
// router.param('searchString', function(req, res, next, searchString){
//   console.log('seeing if searchString is valid');
//   if (typeof(req.query.searchString) === "string"){
//     next();
//   }else{
//     res.json({'error': 'Not a valid pageNum value'});
//   }
// });  



//request for article by id
router.get( '/api/v1/articles/id/:article_id', function(req, res, next){
  console.log('request for single article with an id of: ' + req.params.article_id);
  var articleId = req.params.article_id;
  apiV1.getArticleById(pageNum, articleId, function(err, post){
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
  apiV1.getMostRecentArticles(pageNum, function(err, posts){
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
  apiV1.getArticlesByTags(pageNum, paramsInArray, function(err, posts){
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
  apiV1.getArticlesBySearchString(pageNum, searchString, function(err, posts){
    if(err){
      res.send(err);
    }
    else{
      res.json(posts);
    }
  });
});

module.exports = router;