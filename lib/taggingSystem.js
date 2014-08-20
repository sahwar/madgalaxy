var config = require('../config.json');
var debug = require('debug')('taggingSystem');

/**
 * makes a slug from title
 * compliments of: http://blog.benmcmahen.com/post/41122888102/creating-slugs-for-your-blog-using-express-js-and
 * @param  {string} text
 */
function slugify(text) {
  return text.toString().toLowerCase()
    .replace(/\s+/g, " ") // Replace spaces with space
    .replace(/[^\w\-\s]+/g, ' ') // Remove all non-word chars
    .replace(/\-\-+/g, ' - ') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, ''); // Trim - from end of text
}
/**
 * Generates (acceptable) tags from article - acceptable as in they are listed in config.json
 * @param  {strin}   articleTitle
 * @param  {string}   articleDescription
 * @param  {Function} callback
 */
function tagArticle(post, callback) {
  var tags = post.tags;
  var articleTitle = slugify(post.title).split(" ");
  var articleDescription = slugify(post.content).split(" ");
  //finds all first level tags
  for (var tag in config.tags) {
    //finds all 2nd level tags - or variations of first level tags
    for (var tagVarient in config.tags[tag]) {
      //if 2nd level tag is in title, and 1st level tag is not already in tags, add 1st level tag to article
      if (articleTitle.indexOf(config.tags[tag][tagVarient]) != -1 && tags.indexOf(tag) == -1) {
        tags.push(tag);
      }
      //if 2nd level tag is in description, and 1st level tag is not already in tags, add 1st level tag to article
      if (articleDescription.indexOf(config.tags[tag][tagVarient]) != -1 && tags.indexOf(tag) == -1) {
        tags.push(tag);
      }
    }
  }
  if (tags.length == 0) {
    debug('Could not generate tags for: ' + articleTitle);
  }
  //used null just to follow convention, but eventually add in err trace
  callback(null, tags);
}

exports.tagArticle = tagArticle;