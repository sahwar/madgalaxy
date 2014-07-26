var mongoose = require('mongoose');
var debug = require('debug')('api_v1');
var config = require('../config.json');
var fs = require('fs');
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
function getArticlesBySearchString(page, searchString, searchTag, callback) {
    console.log('hey hey');
    mongoose
        .model('postModel')
        .search(
            { 
                "query":searchString  
            },
            {hydrate:true},
            function (err, results) {
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
    callback(null, config.tags); //null represents err
    config = require('../config.json');
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

/**
 * Adds a tag to config.json
 * @param {int}   page     
 * @param {array}   addMe    [1st level tag, 2nd level tags]
 * @param {Function} callback 
 */
function addTag(page, addMe, callback) {
    config.tags[addMe.first_level] = addMe.second_level;
    callback(null, config.tags); //null represents err 
    fs.writeFile('./config.json', JSON.stringify(config, null, 4),function (err, results) {
        debug('updated config file with options: ' + JSON.stringify(addMe));
    }); 
    config = require('../config.json');
}


function deleteTag(page, deleteMe, callback) {
    delete config.tags[deleteMe];
    callback(null, config.tags); //null represents err 
    fs.writeFile('./config.json', JSON.stringify(config, null, 4),function (err, results) {
        debug('removed from config file: ' + JSON.stringify(deleteMe));
    });
    config = require('../config.json');
}



exports.getArticlesBySearchString = getArticlesBySearchString;
exports.getMostRecentArticles = getMostRecentArticles;
exports.getUntaggedArticles = getUntaggedArticles;
exports.getArticlesByTags = getArticlesByTags;
exports.getCurrentTags = getCurrentTags;
exports.getArticleById = getArticleById;
exports.deleteTag = deleteTag;
exports.addTag = addTag;