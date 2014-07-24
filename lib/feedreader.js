/*----------------------------------------------------
  Global Variables
 ---------------------------------------------------*/
var feedparser = require('feedparser');
var request = require('request');
var config = require('../config.json');
var taggingSystem = require('./taggingSystem.js');
var mongoose = require('mongoose');
var colors = require('colors');
var mongoosastic = require('mongoosastic');
var modelPost = require('./models/post.js');
var elasticsearch = require('elasticsearch');

//Mongoose setup
var mongooseUrl = process.env.MONGOHQ_URL || 'mongodb://127.0.0.1/planet';
mongoose.connect(mongooseUrl);
var postSchema = mongoose.model('postModel');

/*----------------------------------------------------
  Build Functions
 ---------------------------------------------------*/
/**
 * Does the doc already exist?
 * @param  {object}   post     document
 * @param  {Function} callback bool
 * @return {bool}            does it exists
 */
function findPost(post, callback) {
    var testVal;
    postSchema.findOne({
        link: post.link
    }).exec(function (err, foobar) {
        if (foobar) {
            testVal = true;
            callback(testVal);
        } else {
            testVal = false;
            callback(testVal);
        }
    });
}

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
     * @param  {object} err
     * @param  {object} results
     */
    mongoose.model('postModel').findOne({
        title: postToSave.title
    }).exec(function (err, results) {
        /**
         * It does exist - so I will delete it and then save it again with the old ID
         */
        if (results) {
            var preserveID = results._id;
            postToSave._id = preserveID;
            mongoose.model('postModel').remove({
                title: postToSave.title
            }).exec(function (err, result) {
                postToSave.save(function (err, products, numberAffected) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log(('rewriting document: '.red + postToSave.title));
                    }
                });
            });

        }
        /**
         * It doesnt exist so I will just save it
         */
        else {
            postToSave.save(function (err, products, numberAffected) {
                if (err) {
                    console.log(err);
                } else {
                    console.log(('Adding the post to DB: '.red + postToSave.title));
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
        console.log('Doc does not have all required data: ' + JSON.stringify(post.link));
    }
}

/**
 * This is what gets the articles from the rss feeds
 * @param  {object}   blog
 * @param  {Function} callback
 */
function build(blog, callback) {
    var counter = 1;
    var req = request(blog.feed);
    var parser = new feedparser();

    req.on('error', function (error) {
        // handle any request errors
        console.log(error);
    });
    req.on('response', function (res) {
        var stream = this;
        if (res.statusCode !== 200) {
            return this.emit('error', new Error('Bad status code (' + res.statusCode + ') from: ' + String(blog.link)));
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
        console.error('%s - build error (%s) - [%s]: %s', new Date(), blog.feed, err, err.code);
        if (callback) callback();
        callback = null;
    });
}

/*----------------------------------------------------
  Startup Functions and Variables
 ---------------------------------------------------*/
function setup() {
    for (var site in config.feeds) {
        build(config.feeds[site], function () {});
    }
}

/**
 * Drops and creates postmodels index - this helps prevent duplicates and is more 'functional'
 */
function setupES(callback) {
    var esClient = new elasticsearch.Client({
        host: [
            process.env.BONSAI_URL
        ],
        log: 'trace'
    });
    //this allows you to create and drop the ES index
    esClient.indices.delete({
        index: 'postmodels',
        ignore: [404]
    }).then(function (body) {
        console.log('index was deleted or never existed');
        esClient.indices.create({
            index: 'postmodels',
            ignore: [404]
        }).then(function (body) {
            console.log('index was created');
            callback();
        }, function (error) {
            console.log('error creating index'.red);
        });
    }, function (error) {
        console.log('error deleteing index'.red);
    });
}

setupES(function () {
    setup();
});

var minutes = 30;
var theInterval = minutes * 60 * 1000;
setInterval(function () {
    console.log("//---------------------This is the periodic update--------------------//");
    setupES(function () {
        setup();
    });
}, theInterval);

