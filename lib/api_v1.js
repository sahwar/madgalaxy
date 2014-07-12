var mongoose = require('mongoose');
var perPage  = 10;

/**
 * retreives articles from tags
 * @param  {int}   page     pageNum
 * @param  {array}   tags     tags requested
 * @param  {Function} callback function(err, results)
 */
function getArticlesByTags(page, tags, callback){
  mongoose
    .model('postModel')
    .find( { tags: {$in: tags} })
    .sort({'displayDate': 'desc'})
    .limit(10)
    .skip(perPage * (page-1))
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
function getArticleById(page, id, callback){
  mongoose
    .model('postModel')
    .findById(id, function (err, docs) {
        callback(err, docs);
    });
}


function parseSearchResults(results, callback){
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
function getArticlesBySearchString(page, searchString, callback){
  mongoose
    .model('postModel')
    .search({query: searchString}, {hydrate: true}, function(err, results) {
      //parseSearchResults(results, function(err, parsedResults){
        callback(err, results.hits);
      //});
    });

  // mongoose.model('postModel').textSearch( searchString, {lean:true}, function (err, output) {
  //   parseSearchResults(output, function(err, results){
  //     console.log(results);
  //   });
  // });


}

/**
 * Fetches the untagged articles
 * @param  {int}   page     pageNum
 * @param  {Function} callback err, results
 */
function getUntaggedArticles(page, callback){
  mongoose
    .model('postModel')
    .find({tags:[]})
    .sort({'displayDate': 'desc'})
    .limit(10)
    .skip(perPage * (page-1))
    .exec(function(err, posts) {
        callback(err, posts);
    });  
}

/**
 * Fetches the most recent articles in the db
 * @param  {int}   page     pageNum
 * @param  {Function} callback err, results
 */
function getMostRecentArticles(page, callback){
  mongoose
    .model('postModel')
    .find()
    .sort({'displayDate': 'desc'})
    .limit(10)
    .skip(perPage * (page-1))
    .exec(function(err, posts) {
        callback(err, posts);
    });  
}



exports.getArticlesBySearchString = getArticlesBySearchString;
exports.getMostRecentArticles     = getMostRecentArticles;
exports.getUntaggedArticles       = getUntaggedArticles;
exports.getArticlesByTags         = getArticlesByTags;
exports.getArticleById            = getArticleById;