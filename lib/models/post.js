/*---------------------------------------------------------------------
  Global variables
 --------------------------------------------------------------------*/
  var url = require('url');
  var colors = require('colors');
  var elasticConnection = url.parse(process.env.BONSAI_URL || 'http://127.0.0.1:9200');
  var mongoose   = require('mongoose');
  var mongoosastic = require('mongoosastic');
  var elasticsearch = require('elasticsearch');
  var textSearch = require('mongoose-text-search');
  var Schema     = mongoose.Schema;

  // Elastic Connection Options
  var elasticConnectionAuth = elasticConnection.auth || '';
  
  var elasticOptions = {
      hosts: [
        process.env.BONSAI_URL
      ],
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
  function setupES(callback){
    console.log('authentication: '+ String(elasticConnectionAuth));
    var esClient = new elasticsearch.Client({  //I would do it like this --> var esClient = new elasticsearch.Client(elasticOptions); but it throws an error
      hosts: [
        process.env.BONSAI_URL
      ],
      log: 'trace'
    });
     //this allows you to create and drop the ES index
    esClient.indices.delete({
      index: 'postmodels',
      ignore: [404]
    }).then(function (body) {
      console.log('index was deleted or never existed');

      esClient.indices.create({
        index: 'postmodels',
        ignore: [404]
      }).then(function (body) {
        console.log('index was created');
      }, function (error) {
        console.log('error creating index'.red);
      });
      callback();


    }, function (error) {
      console.log('error deleteing index'.red);
    });
      
  }
/*---------------------------------------------------------------------
  end - Setup
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
  //postSchema.plugin(textSearch);
  //postSchema.index({ content:'text' });
  mongoose.model('postModel', postSchema);

/*---------------------------------------------------------------------
  end - Finally doing stuff
 --------------------------------------------------------------------*/
exports.setupES = setupES;
