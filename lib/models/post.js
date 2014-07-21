/*---------------------------------------------------------------------
  Global variables
 --------------------------------------------------------------------*/
  var url               = require('url');
  var colors            = require('colors');
  var elasticConnection = url.parse(process.env.BONSAI_URL || 'http://127.0.0.1:9200');
  var mongoose          = require('mongoose');
  var mongoosastic      = require('mongoosastic');
  var elasticsearch     = require('elasticsearch');
  var Schema            = mongoose.Schema;

  var elasticOptions = {
    host: elasticConnection.hostname,
    port: elasticConnection.port,
    secure: elasticConnection.protocol === 'https:' ? true : false,
    auth: {
       username: elasticConnection.auth.split(':')[0],
        password: elasticConnection.auth.split(':')[1]
    }
  };


  // var client = new elasticsearch.Client({
  //   host: elasticConnection.hostname,
  //   port: elasticConnection.port,
  //   secure: elasticConnection.protocol === 'https:' ? true : false,
  //   auth: {
  //      username: elasticConnection.auth.split(':')[0],
  //       password: elasticConnection.auth.split(':')[1]
  //   },
  //   log:'trace'
  // });

/*---------------------------------------------------------------------
  end- Global variables
 --------------------------------------------------------------------*/

/*---------------------------------------------------------------------
  Finally doing stuff
 --------------------------------------------------------------------*/
  var postSchema = new Schema({
      title:        {type: String, es_indexed:true, index: true},
      slug:         {type: String},
      link:         {type: String, index: true, required: true},
      displayDate:  { type: Date, required:true},
      author:       {type: String, es_indexed:true},
      isoTimeStamp: String,
      content:      {type: String, es_indexed:true},
      tags:         {type: [String], index:true}
  });

  postSchema.plugin(mongoosastic, {host:elasticConnection.hostname, curlDebug:true, auth: elasticConnection.auth, port: '', protocol: elasticConnection.protocol === 'https:' ? 'http' : 'https'});
  mongoose.model('postModel', postSchema);

/*---------------------------------------------------------------------
  end - Finally doing stuff
 --------------------------------------------------------------------*/
