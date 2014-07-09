/*---------------------------------------------------------------------
  Global variables
 --------------------------------------------------------------------*/
  var url = require('url');
  var colors = require('colors');
  var elasticConnection = url.parse(process.env.BONSAI_URL || 'http://127.0.0.1:9200');
  var mongoose   = require('mongoose');
  var mongoosastic = require('mongoosastic');
  var elasticsearch = require('elasticsearch');
  var Schema     = mongoose.Schema;

  // Elastic Connection Options
  var elasticConnectionAuth = elasticConnection.auth || '';
  
  var elasticOptions = {
    secure: elasticConnection.protocol === 'https:' ? true : false,
    host:   elasticConnection.hostname,
    port:   elasticConnection.port,
    auth:{
        username: elasticConnectionAuth.split(':')[0],
        password: elasticConnectionAuth.split(':')[1]
    },
    log: 'trace'
  };

/*---------------------------------------------------------------------
  end- Global variables
 --------------------------------------------------------------------*/


/*---------------------------------------------------------------------
  Print info in console
 --------------------------------------------------------------------*/
  console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ElasticSearch~~~~~~~~~~~~~~~~~~~~~~~~~~~~~'.magenta);
  console.log(('BONSAI_URL = ' + process.env.BONSAI_URL).magenta);
  console.log(('ElasticOptions '.magenta + JSON.stringify(elasticOptions, null, 2).magenta));
  console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~/ElasticSearch/~~~~~~~~~~~~~~~~~~~~~~~~~~~~'.magenta);
/*---------------------------------------------------------------------
  end - Print info in console
 --------------------------------------------------------------------*/
  

/*---------------------------------------------------------------------
  Setup
 --------------------------------------------------------------------*/
  function setupES(){
    var esClient = new elasticsearch.Client({  //I would do it like this --> var esClient = new elasticsearch.Client(elasticOptions); but it throws an error
      secure: elasticConnection.protocol === 'https:' ? true : false,
      host: {
        host: elasticConnection.hostname,
        port: elasticConnection.port,
        protocol: elasticConnection.protocol,
        auth:{
          username: elasticConnectionAuth.split(':')[0],
          password: elasticConnectionAuth.split(':')[1]
        }
      },
      log: 'trace'
    });
  }
/*---------------------------------------------------------------------
  end - Setup
 --------------------------------------------------------------------*/


/*---------------------------------------------------------------------
  Finally doing stuff
 --------------------------------------------------------------------*/
  setupES();
  var postSchema = new Schema({
      title: {type: String, es_indexed:true, unique: true},
      link: { type: String, index: true, required: true, unique: true },
      displayDate: { type: Date, index: true, required:true, es_indexed:true},
      author: {type: String, es_indexed:true},
      isoTimeStamp: String,
      content: {type: String, es_indexed:true},
      tags: {type: [String], es_indexed:true}
  });

  postSchema.plugin(mongoosastic, elasticOptions);
  mongoose.model('postModel', postSchema);

/*---------------------------------------------------------------------
  end - Finally doing stuff
 --------------------------------------------------------------------*/

