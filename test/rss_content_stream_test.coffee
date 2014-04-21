require './helpers'


describe "RSSContentStream", ->
  RSSContentStream = require('../lib/rss_content_stream').RSSContentStream

  describe "with real RSS feed", ->
    feed_item = null

    before (ready) ->
      opts =
        feed_url: "http://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml"
        interval: 1

      RSSContentStream.create(opts).on 'data', (item) ->
        unless feed_item
          feed_item = item
          ready()
        return
      return

    it "has a title", ->
      feed_item.title.should.be.a.String
      return

    it "has a description", ->
      feed_item.description.should.be.a.String
      return

    it "has atom:link", ->
      feed_item['atom:link'],should.be.an.Object
    return
  return
