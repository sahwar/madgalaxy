var express = require('express');
var router = express.Router();
var feedreader = require('../lib/feedreader.js');

/* GET home page. */
router.get('/', function(req, res) {

  if(req.query.id){
    console.log(('Here is the id of the document the user is trying to access: ' + req.query.id));
    feedreader.getArticleById(req.query.id, function(post){
      var article = [];
      article[0] = post;
      res.render(
        'singleArticle', {data: article, uri: 'http://www.planetnodejs.com/article/'+post.title}
      );
    });
  }
  else if(req.query.searchString){
    console.log(('Here is the users search: ' + req.query.searchString));
    feedreader.getArticlesBySearchString(req.query.searchString, function(results){
      res.render(
        'search', {data: results, uri: 'http://www.planetnodejs.com/search/' + req.query.searchString}
      );
    });
  }
  else if(req.query.searchTag){
    console.log('The user is simplifying results with the tag: ' + req.query.searchTag);
    feedreader.getArticlesByTag(req.query.searchTag, function(results){
     res.render(
        'search', {data: results, uri: 'http://www.planetnodejs.com/tag/' + req.query.searchTag}
      );
    });
  }
  else if (req.query.page){
    console.log('Here is the page the user is requesting: ' + req.query.page);
    feedreader.getArticlesWithPageNum(req.query.page, function(posts) {    
      res.render(
        'index', {data: posts, uri: 'http://www.planetnodejs.com', page: req.query.page}
      );
        
    });

  }
  else {
    feedreader.run(function(posts) {    
      res.render(
        'index', {data: posts, uri: 'http://www.planetnodejs.com', page: 1}
      );
        
    });
  }
});

router.get( '/feed/*', function(req, res){
  var paramsInArray = req.params[0].split("/");
  // Sending the feed as a response
  feedreader.getRSS(paramsInArray, function(feed){
    // Setting the appropriate Content-Type
    res.set('Content-Type', 'text/xml');
    // Sending the feed as a response
    res.send(feed);
  });
});


module.exports = router;