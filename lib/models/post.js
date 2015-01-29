/*---------------------------------------------------------------------
  Global variables
 --------------------------------------------------------------------*/
var url = require('url');
var elasticConnection = url.parse("https://41gtgqrs:zcfwxb0h8fs9xqy7@smoke-9606326.us-east-1.bonsai.io:443/");
var mongoose = require('mongoose');
var mongoosastic = require('mongoosastic');
var elasticsearch = require('elasticsearch');
var Schema = mongoose.Schema;

var elasticOptions = {
  host: elasticConnection.hostname,
  port: elasticConnection.port,
  secure: elasticConnection.protocol === 'https:' ? true : false,
  auth: {
    username: elasticConnection.auth.split(':')[0],
    password: elasticConnection.auth.split(':')[1]
  }
};

/*---------------------------------------------------------------------
  Finally doing stuff
 --------------------------------------------------------------------*/
var postSchema = new Schema({
  title: {
    type: String,
    es_indexed: true,
    index: true
  },
  slug: {
    type: String
  },
  link: {
    type: String,
    index: true,
    required: true
  },
  displayDate: {
    type: Date,
    required: true
  },
  author: {
    type: String,
    es_indexed: true,
    index: true
  },
  content: {
    type: String,
    es_indexed: true,
    index: false
  },
  tags: {
    type: Array,
    es_indexed: true,
    index: true
  },
  views: {
    type: Number,
    default: 0,
    index: true
  }
});

postSchema.plugin(mongoosastic, {
  host: elasticConnection.hostname,
  auth: elasticConnection.auth,
  port: '',
  //curlDebug: true,
  protocol: elasticConnection.protocol === 'https:' ? 'http' : 'https'
});
mongoose.model('postModel', postSchema);