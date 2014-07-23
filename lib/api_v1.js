var mongoose = require('mongoose');
var config   = require('../config.json');
var perPage = 10;

/**
 * retreives articles from tags
 * @param  {int}   page     pageNum
 * @param  {array}   tags     tags requested
 * @param  {Function} callback function(err, results)
 */
function getArticlesByTags(page, tags, callback) {
    mongoose
        .model('postModel')
        .find({
            tags: {
                $in: tags
            }
        })
        .sort({
            'displayDate': 'desc'
        })
        .limit(perPage)
        .skip(perPage * (page - 1))
        .exec(function (err, posts) {
            callback(err, posts);
        });
}

/**
 * fetches article from an _id
 * @param  {int}   page     pageNum
 * @param  {string}   id       id of article
 * @param  {Function} callback err, results
 */
function getArticleById(page, id, callback) {
    mongoose
        .model('postModel')
        .findById(id, function (err, docs) {
            callback(err, docs);
        });
}


function parseSearchResults(results, callback) {
    var parsedResults = [];
    for (var i = 0; i < results.hits.length; i++) {
        parsedResults.push(results.hits[i]._source);
    }

    callback(null, parsedResults);
}

/**
 * elastic search through documents
 * @param  {int}   page         pageNum
 * @param  {string}   searchString string the user is searching with
 * @param  {Function} callback     err, results
 */
function getArticlesBySearchString(page, searchString, callback) {
    mongoose
        .model('postModel')
        .search({
            query: searchString
        }, {
            hydrate: true
        }, function (err, results) {
            callback(err, results.hits);
        });
}

/**
 * Fetches the untagged articles
 * @param  {int}   page     pageNum
 * @param  {Function} callback err, results
 */
function getUntaggedArticles(page, callback) {
    mongoose
        .model('postModel')
        .find({
            tags: []
        })
        .sort({
            'displayDate': 'desc'
        })
        .limit(10)
        .skip(perPage * (page - 1))
        .exec(function (err, posts) {
            callback(err, posts);
        });
}

/**
 * Finds usable tags
 * @param  {int}   page     pageNum <-- not used, but there to keep consistency
 * @param  {Function} callback err, results
 */
function getCurrentTags(page, callback) {
    function createTagsArray() {
        var tags = [];
        for (var tag in config.tags) {
            tags.push(tag);
        }
        return tags;
    }
    callback(null, createTagsArray() ); //null represents err
}

/**
 * Fetches the most recent articles in the db
 * @param  {int}   page     pageNum
 * @param  {Function} callback err, results
 */
function getMostRecentArticles(page, callback) {
    mongoose
        .model('postModel')
        .find()
        .sort({
            'displayDate': 'desc'
        })
        .limit(10)
        .skip(perPage * (page - 1))
        .exec(function (err, posts) {
            callback(err, posts);
        });
}



exports.getArticlesBySearchString   = getArticlesBySearchString;
exports.getMostRecentArticles       = getMostRecentArticles;
exports.getUntaggedArticles         = getUntaggedArticles;
exports.getArticlesByTags           = getArticlesByTags;
exports.getCurrentTags              = getCurrentTags;
exports.getArticleById              = getArticleById;