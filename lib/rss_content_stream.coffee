EventEmitter = require('events').EventEmitter
Readable     = require('stream').Readable

fetch_rss = require './fetch_rss_performer'


class RSSContentStream extends Readable

  constructor: (opts) ->
    super(opts)

    @feed_source = opts.feed_source

    @feed_source.on 'data', (item) =>
      unless @push(item)
        @feed_source.pause()
      return

  _read: ->
    @feed_source.resume()
    return

  # Create an RSSContentStream instance.
  #
  # opts - Options hash Object.
  #   .feed_url - URL String of the RSS feed to fetch.
  #   .interval - Polling interval in minutes.
  #
  # Returns an API Object.
  @create = (opts) ->
    opts or= {}
    opts.interval = if opts.interval then Math.round(opts.interval * 60 * 1000) or 7000
    opts.feed_source = create_feed_source(opts)
    opts.objectMode = on
    return new RSSContentStream(opts)

exports.RSSContentStream = RSSContentStream


# Private
#
create_feed_source = (opts) ->
  opts or= {}
  feed_url = opts.feed_url
  interval = opts.interval
  queue = []
  paused = yes
  api = Object.create(new EventEmitter())

  api.resume = ->
    paused = no
    emit_data()
    return api

  api.pause = ->
    paused = yes
    return api

  emit_data = ->
    if not paused and queue.length
      api.emit('data', queue.shift())
      process.nextTick(emit_data)
    return

  oninterval = ->
    fetch_rss.perform({feed_url: feed_url})
      .then(onfetch)
      .catch(onerror)
    return

  onfetch = (feedparser) ->
    feedparser.on('error', onerror)
    feedparser.on 'readable', -> read_feed(feedparser)
    return

  read_feed = (feedparser) ->
    if item = feedparser.read()
      queue.push(item)
      emit_data()
      return read_feed(feedparser)
    return

  onerror = (err) ->
    api.emit('error', err)
    return

  setInterval(oninterval, interval)
  oninterval()

  return api
