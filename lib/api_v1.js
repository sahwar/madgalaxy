var mongoose = require('mongoose');
var debug = require('debug')('api_v1');
var config = require('../config.json');
var fs = require('fs');


/*------------------------------------------------------
  Helper Functions
 -----------------------------------------------------*/

function _helper_inArray(item, array) {
  if (array.indexOf(item) == -1) {
    return false;
  } else {
    return true;
  }
}

function _helper_userTagAcceptable(tagToAdd) {
  var acceptableTags = [];
  for (tag in config.tags) {
    acceptableTags.push(tag);
  }
  return _helper_inArray(tagToAdd, acceptableTags);
}

function _helper_makeUserTagWhitelistTag(tag, userAddedTags) {
  var numberTimes = 0;
  for (var i = 0; i < userAddedTags.length; i++) {
    if (userAddedTags[i] == tag) {
      numberTimes++;
    }
  };
  if (numberTimes >= 3) {
    return true;
  } else {
    return false;
  }
}



/*------------------------------------------------------
  Main Functions
 -----------------------------------------------------*/
/**
 * retreives articles from tags
 * @param  {int}   page     pageNum
 * @param  {array}   tags     tags requested
 * @param  {Function} callback function(err, results)
 */
function getArticlesByTags(page, perPage, tags, callback) {
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
    .exec(function(err, posts) {
      callback(err, posts);
    });
}

/**
 * fetches article from an _id
 * @param  {int}   page     pageNum
 * @param  {string}   id       id of article
 * @param  {Function} callback err, results
 */
function getArticleById(page, perPage, id, callback) {
  mongoose
    .model('postModel')
    .findById(id, function(err, docs) {
      callback(err, docs);
    });
}

/**
 * fetches article from an _id and increases views by 1
 * @param  {int}   page     pageNum
 * @param  {string}   id       id of article
 * @param  {Function} callback err, results
 */
function increaseArticleViews(page, perPage, id, callback) {
  mongoose
    .model('postModel')
    .findById(id, function(err, doc) {
      doc.views = doc.views + 1;
      doc.save(function(err){
        callback(err);
      });
    });
}

/**
 * adds tag to doc.userAddedTags, and if in whitelist, adds to doc.tags
 * @param {int}   page     not used
 * @param {string}   id       id of article
 * @param {string}   tag      the tag to add to artice
 * @param {Function} callback err, results
 */
function addUserTagToArticle(page, perPage, id, tag, callback) {
  mongoose
    .model('postModel')
    .findById(id, function(err, doc) {
      doc.userAddedTags.push(tag);
      var testVar = _helper_makeUserTagWhitelistTag(tag, doc.userAddedTags);
      console.log('should I make tag: ' + tag + ' a whitelist tag? ' + testVar);

      //if there is enough one user added tag, add it to the whitelist in config.json
      if(_helper_makeUserTagWhitelistTag(tag, doc.userAddedTags)){
        var tag_to_add = new Object();
        tag_to_add.first_level = tag;
        tag_to_add.second_level = [tag];
        addTag(page, tag_to_add);
      }

      if (_helper_userTagAcceptable(tag) && (!_helper_inArray(tag, doc.tags))) {
        debug('User tag is acceptable. Adding to tags');
        doc.tags.push(tag);
      }
      doc.save(function(err, products, numberAffected) {
        callback(err, products);
      });
    });
}

//this is used to remove all the crap elasticsearch adds to docs
function parseSearchResults(results, callback) {
  callback(null, results.hits);
}

/**
 * elastic search through documents
 * @param  {int}   page         pageNum
 * @param  {string}   searchString string the user is searching with
 * @param  {Function} callback     err, results
 */
function getArticlesBySearchString(page, perPage, searchString, searchTag, callback) {
  mongoose
    .model('postModel')
    .search({
        "query": {
          "bool": {
            "must": [{
              "match": {
                "tags": {
                  "query": searchTag,
                  "operator": "and"
                }
              }
            }, {
              "match": {
                "content": {
                  "query": searchString,
                  "type": "phrase"
                }
              }
            }]
          }
        },
        "size": perPage,
        "from": (perPage * (page - 1))
      }, {
        hydrate: true
      },
      function(err, results) {
        parseSearchResults(results, function(error, parsedResults) {
          callback(err, parsedResults);
        });
      });
}

/**
 * Fetches the untagged articles
 * @param  {int}   page     pageNum
 * @param  {Function} callback err, results
 */
function getUntaggedArticles(page, perPage, callback) {
  mongoose
    .model('postModel')
    .find({
      tags: []
    })
    .sort({
      'displayDate': 'desc'
    })
    .limit(perPage)
    .skip(perPage * (page - 1))
    .exec(function(err, posts) {
      callback(err, posts);
    });
}

/**
 * Finds usable tags
 * @param  {int}   page     pageNum <-- not used, but there to keep consistency
 * @param  {Function} callback err, results
 */
function getCurrentTags(page, perPage, callback) {
  callback(null, config.tags); //null represents err
  config = require('../config.json');
}

/**
 * Fetches the most recent articles in the db
 * @param  {int}   page     pageNum
 * @param  {Function} callback err, results
 */
function getMostRecentArticles(page, perPage, callback) {
  mongoose
    .model('postModel')
    .find()
    .sort({
      'displayDate': 'desc'
    })
    .limit(perPage)
    .skip(perPage * (page - 1))
    .exec(function(err, posts) {
      callback(err, posts);
    });
}

/**
 * Adds a tag to config.json
 * @param {int}   page
 * @param {array}   addMe    [1st level tag, 2nd level tags]
 * @param {Function} callback
 */
function addTag(page, perPage, addMe, callback) {
  config.tags[addMe.first_level] = addMe.second_level;
  if(callback){
    callback(null, config.tags); //null represents err 
  }
  fs.writeFile('./config.json', JSON.stringify(config, null, 4), function(err, results) {
    debug('updated config file with options: ' + JSON.stringify(addMe));
  });
  config = require('../config.json');
}

/**
 * Removes tag from config file
 * @param  {int}   page - kept for consistency
 * @param  {string}   deleteMe - tag to be deleted
 * @param  {Function} callback
 */
function deleteTag(page, perPage, deleteMe, callback) {
  delete config.tags[deleteMe];
  if(callback){
    callback(null, config.tags); //null represents err 
  }
  fs.writeFile('./config.json', JSON.stringify(config, null, 4), function(err, results) {
    debug('removed from config file: ' + JSON.stringify(deleteMe));
  });
  config = require('../config.json');
}


exports.getArticlesBySearchString = getArticlesBySearchString;
exports.getMostRecentArticles = getMostRecentArticles;
exports.increaseArticleViews = increaseArticleViews;
exports.addUserTagToArticle = addUserTagToArticle;
exports.getUntaggedArticles = getUntaggedArticles;
exports.getArticlesByTags = getArticlesByTags;
exports.getCurrentTags = getCurrentTags;
exports.getArticleById = getArticleById;
exports.deleteTag = deleteTag;
exports.addTag = addTag;