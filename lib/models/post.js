/*---------------------------------------------------------------------
  Global variables
 --------------------------------------------------------------------*/
  var url               = require('url');
  var colors            = require('colors');
  var elasticConnection = url.parse(process.env.BONSAI_URL || 'http://127.0.0.1:9200');
  var mongoose          = require('mongoose');
  var mongoosastic      = require('mongoosastic');
  var textSearch        = require('mongoose-text-search');
  var Schema            = mongoose.Schema;
  console.log(process.env);
  var elasticOptions = {
    hosts:{
      host:     elasticConnection.hostname,
      protocol: elasticConnection.protocol,
      auth:     elasticConnection.auth
    },
     log: 'trace'
  };
  //var elasticOptions = {hosts: [elasticConnection], log:'trace'};

 console.log(elasticOptions);

/*---------------------------------------------------------------------
  end- Global variables
 --------------------------------------------------------------------*/

/*---------------------------------------------------------------------
  Finally doing stuff
 --------------------------------------------------------------------*/
  var postSchema = new Schema({
      title: {type: String, es_indexed:true, index: true},
      slug: {type: String, es_indexed:true},
      link: { type: String, index: true, required: true},
      displayDate: { type: Date, required:true, es_indexed:true},
      author: {type: String, es_indexed:true},
      isoTimeStamp: String,
      content: {type: String, es_indexed:true},
      tags: {type: [String], es_indexed:true, index:true}
  });

  postSchema.plugin(mongoosastic, elasticOptions);
  mongoose.model('postModel', postSchema);

/*---------------------------------------------------------------------
  end - Finally doing stuff
 --------------------------------------------------------------------*/
