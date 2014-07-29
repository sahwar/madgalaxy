/*----------------------------------------------------
  Global Variables
 ---------------------------------------------------*/
var config        = require('../config.json');
var feedparser    = require('feedparser');
var request       = require('request');
var taggingSystem = require('./taggingSystem.js');
var mongoose      = require('mongoose');
var mongoosastic  = require('mongoosastic');
var elasticsearch = require('elasticsearch');
var debug         = { //logger setup
    feedparser: require('debug')('feedreader:feedparser'),
    articleParser: require('debug')('feedreader:articleParser'),
    elasticsearch: require('debug')('feedreader:elasticsearch')
};

//Setup mongoose
require('./models/post.js');
var mongooseUrl = process.env.MONGOHQ_URL || 'mongodb://127.0.0.1/planet';
mongoose.connect(mongooseUrl);
var postSchema = mongoose.model('postModel');

/*----------------------------------------------------
  Build Functions
 ---------------------------------------------------*/
/**
 * makes a slug from title
 * compliments of: http://blog.benmcmahen.com/post/41122888102/creating-slugs-for-your-blog-using-express-js-and
 * @param  {string} text
 */
function slugify(text) {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-') // Replace spaces with -
        .replace(/[^\w\-]+/g, '') // Remove all non-word chars
        .replace(/\-\-+/g, '-') // Replace multiple - with single -
        .replace(/^-+/, '') // Trim - from start of text
        .replace(/-+$/, ''); // Trim - from end of text
}

function findPost(post, callback){
    mongoose.model('postModel').findOne({
        title: post.title
    }).exec(function (err, results) {
        callback(null, results);
    });
}

function removePost(post, callback){
    mongoose.model('postModel').remove({
        title: post.title
    }).exec(function (err, results) {
        callback(null, results);
    });
}
/**
 * Saves the post - updates if it already exists
 * @param  {object} postToSave the post
 * @return {null}            null
 */
function savePost(postToSave) {
    /**
     * Mongoose does not run pre and post on updates - http://mongoosejs.com/docs/middleware.html
     * Mongoosastic hooks into pre and post, and therefore I cant use any of the methods blacklisted in the link above
     * My work-around is instead of updating a doc, to copy its ID, delete it, then save it again with the old ID and new info
     */
    
    /**
     * Does the document already exist?
     */
    findPost(postToSave, function(err, results) {       
        //It does exist - so I will delete it and then save it again with the old ID 
        //(as well as user added tags so they are not overwritten)
        if (results) {
            var preserveID = results._id;
            var preserveUserTags = results.userAddedTags;
            

            removePost(postToSave, function(error, results) {
                if (error) throw error;
                postToSave._id = preserveID;
                postToSave.userAddedTags = preserveUserTags;
                postToSave.save(function (err, products, numberAffected) {
                    if (err) {
                        debug.articleParser('Error saving document: ' + err);
                    } else {
                        debug.articleParser(('rewriting document: ' + postToSave.title));
                    }
                });
            });
        }
        //It doesnt exist so I will just save it         
        else {
            postToSave.save(function (err, products, numberAffected) {
                if (err) {
                    debug.articleParser('Error saving document: ' + err);
                } else {
                    debug.articleParser(('Adding the post to DB: ' + postToSave.title));
                }
            });
        }
    });
}

/**
 * Checks to see if post has all required info, generates the tags, and then sends if off to be saved
 * @param  {multi-dimmensional array} post        the article
 * @return {null}
 */
function parsePost(post) {
    //does it have everything that we need?
    if (post && post.title != '' && post.title != 'No title' && post.title && post.description) {
        taggingSystem.tagArticle(post.title, post.description, function (err, tags) {
            var postObject = new postSchema({
                title: post.title,
                slug: slugify(post.title),
                site: post.blog,
                displayDate: post.pubdate.toString('MM dd yyyy'),
                content: post.description,
                link: post.link,
                author: post.author,
                tags: tags
            });
            savePost(postObject);
        });
    } else {
        debug.articleParser('Doc does not have all required data: ' + JSON.stringify(post.link));
    }
}

/**
 * This is what gets the articles from the rss feeds
 * @param  {object}   blog
 * @param  {Function} callback
 */
function build(blog, callback) {
    var counter = 0;
    var req = request(blog.feed);
    var parser = new feedparser();

    req.on('error', function (error) {
        // handle any request errors
        debug.feedparser(error);
    });
    req.on('response', function (res) {
        var stream = this;
        if (res.statusCode !== 200) {
            return debug.feedparser('error', new Error('Bad status code (' + res.statusCode + ') from: ' + String(blog.link)));
        }
        stream.pipe(parser);
    });
    parser.on('readable', function () {
        // This is where the action is!
        var stream = this;
        var post;
        while (post = stream.read()) {
            parsePost(post);
        }
        counter++;
    });
    parser.on('end', function () {
        counter--;
        if (counter === 0 && callback) {
            callback();
            callback = null;
        }
    });
    parser.on('error', function (err) {
        debug.feedparser('%s - build error (%s) - [%s]: %s', new Date(), blog.feed, err, err.code);
        if (callback) callback();
        callback = null;
    });
}

/*----------------------------------------------------
  Startup Functions and Variables
 ---------------------------------------------------*/
function setup() {
    for (var site in config.feeds) {
        build(config.feeds[site], function () {
            debug.feedparser(' --done--');
        });
    }
}

/**
 * Drops and creates postmodels index - this helps prevent duplicates and is more 'functional'
 */
function setupES(callback) {
    var esClient = new elasticsearch.Client({
        host: [
            process.env.BONSAI_URL
        ]
    });
    //this allows you to create and drop the ES index
    esClient.indices.delete({
        index: 'postmodels',
        ignore: [404]
    }).then(function (body) {
        debug.elasticsearch('index was deleted or never existed');
        esClient.indices.create({
            index: 'postmodels',
            ignore: [404]
        }).then(function (body) {
            debug.elasticsearch('index was created');
            callback();
        }, function (error) {
            debug.elasticsearch('error creating index');
        });
    }, function (error) {
        debug.elasticsearch('error deleteing index');
    });
}

setupES(function () {
    setup();
});

var minutes = 30;
var theInterval = minutes * 60 * 1000;
setInterval(function () {
    debug.feedparser("//---------------------This is the periodic update--------------------//");
    setupES(function () {
        setup();
    });
}, theInterval);