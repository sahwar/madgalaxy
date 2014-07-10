var mongoose = require('mongoose');
var perPage  = 10;

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

function getArticleById(page, id, callback){
  mongoose
    .model('postModel')
    .findById(id, function (err, docs) {
        callback(err, docs);
    });
}

function getArticlesBySearchString(page, searchString, callback){
  mongoose.model('postModel').search({query: searchString}, {hydrate: true}, function(err, results) {
    callback(err, results.hits);
  });
}

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
exports.getArticlesByTags         = getArticlesByTags;
exports.getArticleById            = getArticleById;