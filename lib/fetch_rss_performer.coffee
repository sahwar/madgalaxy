Promise    = require('iou').Promise
FeedParser = require 'feedparser'
request    = require 'request'


# Fetch an RSS feed in the form of a Stream Object.
#
# opts - Options hash Object.
#   .feed_url - URL String of the RSS feed to fetch.
#
# Returns a Promise for a Stream.
exports.perform = (opts) ->
  opts or= {}
  {feed_url} = opts
  parser_opts =
    feed_url: feed_url

  promise = new Promise (resolve, reject) ->
    parser = new FeedParser(parser_opts)
    req = request(feed_url)

    req.on('error', reject)

    req.on 'response', (res) ->
      unless res.statusCode is 200
        return reject(new Error("Unexpected HTTP status code: #{res.statusCode}"))
      resolve(parser)
      res.pipe(parser)
      return
    return
  return promise
