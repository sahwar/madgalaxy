/*----------------------------------------------------
  Global Variables
 ---------------------------------------------------*/
var path          = require('path');
var feedparser    = require('feedparser');
var request       = require('request');
var config        = require('../config.json');
var taggingSystem = require('./taggingSystem.js'); 
var mongoose      = require('mongoose');
var colors        = require('colors');
var mongoosastic  = require('mongoosastic');
                    require('./models/post.js');


var mongooseUrl = process.env.MONGOHQ_URL || 'mongodb://127.0.0.1/planet';
mongoose.connect(mongooseUrl);
var postSchema = mongoose.model('postModel');
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
  var upsertData = postToSave.toObject();
  delete upsertData._id;

  postToSave.update({_id: postToSave.id}, upsertData, {upsert: true}, function(err){
    if(err){
      console.log(err);
    }
    else{
      console.log(('Adding the post to DB: '.red + postToSave.title));
    }
  });

  // postToSave.save(function (err, product, numberAffected) {
  //   if (err) {
  //     console.log(err);
  //   } else {
  //     console.log(('Adding the post to DB: '.red + postToSave.title));
  //   }
  // });
}

/**
 * Checks to see if post has all required info, generates the tags, and then sends if off to be saved
 * @param  {multi-dimmensional array} post        the article
 * @param  {array} defaultTags tags that are associated with parent feed
 * @return {null}             
 */
function parsePost(post, defaultTags) {
  findPost(post, function(existBool){
    if (!existBool) { //if it doesnt exists
      //does it have everything that we need?
      if (post && post.title != '' && post.title != 'No title' && post.title && post.description) {
        taggingSystem.tagArticle(post.title, post.description, function(err, tags){
          tagsToSave = tags;      
        });    
        var postObject = new postSchema({
          title: post.title,
          isoTimestamp: post.pubdate,
          site: post.blog,
          displayDate: post.pubdate.toString('MM dd yyyy'),
          content: post.description,
          link: post.link,
          author: post.author,
          tags: tagsToSave
        });
        savePost(postObject);
      }else{
        console.log('Not enough info to add post to database - aka: blank title, blank content, etc.');
      }
    }else{ //if it does exist
      console.log(' - not adding'.yellow);
    }
  });    
}

/**
 * This is what gets the articles from the rss feeds
 * @param  {array}   defaultTags tags associated with feed - obtained from config.json file
 * @param  {object}   blog         
 * @param  {Function} callback    
 */
function build(defaultTags, blog, callback) {
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
      parsePost(post, defaultTags);
    }
    counter++;
  });
  parser.on('end', function() {
    counter--;
    if (counter === 0 && callback) {
      callback();
      callback = null;
    }
  });
  parser.on('error', function(err) {
    console.error('%s - build error (%s) - [%s]: %s', new Date(), blog.feed, err, err.code);
    if (callback) callback();
    callback = null;
  });
}

/*----------------------------------------------------
  end - Build Functions
 ---------------------------------------------------*/

/*----------------------------------------------------
  Startup Functions and Variables
 ---------------------------------------------------*/
function setup(){
  for (var site in config){
    var defaultTags = config[site].tags;
    build(defaultTags, config[site], function() {});
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
