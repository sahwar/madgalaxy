/*
  This is the meat of the application
 */


/*----------------------------------------------------
  Global Variables
 ---------------------------------------------------*/
var path         = require('path');
var feedparser   = require('feedparser');
var request      = require('request');
var config       = require('../config.json');
var mongoose     = require('mongoose');
var colors       = require('colors');
var mongoosastic = require('mongoosastic');
var RSS = require('rss');

require('./models/post.js');
var mongooseUrl = process.env.MONGOHQ_URL || 'mongodb://127.0.0.1/planet';
mongoose.connect(mongooseUrl);
var postSchema = mongoose.model('postModel');

var feed = new RSS({
  title:          'Planet Node JS',
  description:    'A node.js planet (blog aggregator)',
  feed_url:           'http://planetnodejs.com/feed',

  author: 'PlanetNodejs'
});
/*----------------------------------------------------
  end - Global Variables
 ---------------------------------------------------*/

/*----------------------------------------------------
  Build Functions
 ---------------------------------------------------*/

/*
  Checks to see if the doc is in the database
 */
function findPost(post, callback){
  var testVal;
  postSchema.findOne({link: post.link}).exec(function (err, foobar){
    if(foobar) {
      process.stdout.write('Already found the article: ' + foobar.title);
      testVal = true;
      callback(testVal);
    }else{
      testVal = false;
      callback(testVal);
    }
  });
}

/*
  Saves the post if it is not already in the database
 */
function savePost(postToSave) {
  findPost(postToSave, function(testVar) {
    if (!testVar) {
      postToSave.save(function (err, product, numberAffected) {
        if (err) {
          console.log(err);
        } else {
          console.log(('Adding the post to DB: '.red + postToSave.title));
        }
      });
    }else{
      console.log(' - not adding'.yellow);
    }
  });
}

/*
  Makes sure the post has all of the information that is required, and then sends it on to savePost()
 */
function parsePost(post, postTags) {
  if (post && post.title != '' && post.title != 'No title') {
    var postObject = new postSchema({
      title: post.title,
      isoTimestamp: post.pubdate,
      site: post.blog,
      displayDate: post.pubdate.toString('MM dd yyyy'),
      content: post.description,
      link: post.link,
      author: post.author,
      tags: postTags
    });
    savePost(postObject);
  }else{
    console.log('Not enough info to add post to database - aka: blank title, blank content, etc.');
  }
}


/*
  This is what runs through all of the rss feeds
 */
function build(postTags, blog, cb) {
  var counter = 1;
  var req = request(blog.feed);
  var parser = new feedparser();

  req.on('error', function(error) {
    // handle any request errors
    console.log(error);
  });
  req.on('response', function(res) {
    var stream = this;
    if (res.statusCode !== 200) {
      return this.emit('error', new Error('Bad status code'));
    }
    stream.pipe(parser);
  });
  parser.on('readable', function() {
    // This is where the action is!
    var stream = this;
    var post;
    while (post = stream.read()) {
      parsePost(post, postTags);
    }
    counter++;
  });
  parser.on('end', function() {
    counter--;
    if (counter === 0 && cb) {
      cb();
      cb = null;
    }
  });
  parser.on('error', function(err) {
    console.error('%s - build error (%s) - [%s]: %s', new Date(), blog.feed, err, err.code);
    if (cb) cb();
    cb = null;
  });
}

/*----------------------------------------------------
  end - Build Functions
 ---------------------------------------------------*/

/*----------------------------------------------------
  Functions run from route file
 ---------------------------------------------------*/

function run(cb) {
  mongoose
    .model('postModel')
    .find()
    .sort({'displayDate': 'desc'})
    .limit(10)
    .exec(function(err, posts) {
      cb(posts);
    });
}

function getArticlesWithPageNum(pageNum, cb){
  var perPage = 10;
  var page = pageNum > 0 ? pageNum : 0;
  if(pageNum === 'forward'){
    mongoose
    .model('postModel')
    .find()
    .sort({'displayDate': 'desc'})
    .limit(10)
    .exec(function(err, posts) {
      cb(posts);
    });
  }
  else{
    mongoose
      .model('postModel')
      .find()
      .sort({'displayDate': 'desc'})
      .limit(perPage)
      .skip(perPage * (page-1))
      .exec(function(err, posts) {
        cb(posts);
      });
  }
}

function getArticleById(id, cb){
  postSchema
    .findById(id, function (err, doc) {
      console.log('Found the article user was requesting');
      cb(doc);
    });
}

function getArticlesBySearchString(searchString, cb){
  postSchema.search({query: searchString}, function(err, results) {
    if (err) throw err;
    var resultsToCallback = [];
    var esResults = results.hits.hits;
    for (var resultObject in esResults){
      resultsToCallback.push(esResults[resultObject]._source);
    }
    cb(resultsToCallback);
  });
}

function getArticlesByTag(tag, cb) {
  mongoose
    .model('postModel')
    .find( { tags: {$in: [tag]} })
    .sort({'displayDate': 'desc'})
    .exec(function(err, posts) {
      if (err) throw err;
      cb(posts);
    });
}

function getRSS(param, cb){
  if (param){
    mongoose
      .model('postModel')
      .find( { tags: {$in: [param]} })
      .sort({'displayDate': 'desc'})
      .exec(function(err, posts) {
        if (err) throw err;
        var feed = new RSS({
          title: 'Planet Node JS',
          description: 'A node.js planet (blog aggregator)',
          feed_url: 'http://planetnodejs.com/feed',

          author: 'PlanetNodejs'
        });
        for (var i = 0; i < posts.length; i++) {
          
          feed.item({
            title:          posts[i].title,
            description:    posts[i].content,
            url:           posts[i].link,
            content: posts[i].content,
            author: posts[i].author,
            date: posts[i].displayDate,
            pubdate: posts[i].displayDate
          });
        };
        cb(feed.xml());
        console.log('RSS feed built');
      });
  }else{
    mongoose
      .model('postModel')
      .find()
      .sort({'displayDate': 'desc'})
      .limit(10)
      .exec(function(err, posts) {
        if (err) throw err;
        var feed = new RSS({
          title: 'Planet Node JS',
          description: 'A node.js planet (blog aggregator)',
          feed_url: 'http://planetnodejs.com/feed',

          author: 'PlanetNodejs'
        });
        for (var i = 0; i < posts.length; i++) {
          
          feed.item({
            title:          posts[i].title,
            description:    posts[i].content,
            url:           posts[i].link,
            content: posts[i].content,
            author: posts[i].author,
            date: posts[i].displayDate,
            pubdate: posts[i].displayDate
          });
        };
        cb(feed.xml());
        console.log('RSS feed built');
      });
  }
  
  
}
/*----------------------------------------------------
  end - Functions called from route file
 ---------------------------------------------------*/


/*----------------------------------------------------
  Startup Functions and Variables
 ---------------------------------------------------*/
function setup(){
    for (var site in config){
      var postTags = config[site].tags;
      build(postTags, config[site], function() {});
    }
}
setup();
var minutes = 30;
var theInterval = minutes * 60 * 1000;
setInterval(function() {
  console.log("This is the periodic update");
  setup();
}, theInterval);
/*----------------------------------------------------
  end - Startup Functions and Variables
 ---------------------------------------------------*/



exports.run                       = run;
exports.getArticlesWithPageNum    = getArticlesWithPageNum;
exports.getArticleById            = getArticleById;
exports.getArticlesBySearchString = getArticlesBySearchString;
exports.getRSS                    = getRSS;
exports.getArticlesByTag          = getArticlesByTag;