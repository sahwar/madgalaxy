Mad Galaxy
==========

An api, organized like a galaxy, that aggregates, concatenates, and emits feeds.

Development
-----------
To run this on your own machine, there are two options.

The first option is to manually run mongo and node in separate terminal tabs. Here is how you do that:

    __1. Install Dependencies__
    (assuming you've already installed Node.js and elasticsearch)

        npm install

    __2. Start the database dameon__

        cd planet
        mkdir data
        mongod --dbpath data

    __1. Start the databse *IN NEW TAB*__

        mongo

    __2. Run the server *IN ANOTHER NEW TAB*__

        npm start

The second option is to have grunt do everything for you (this is the preferred and easier method). Here is how you do that:

    __1. Install Dependencies__
    (assuming you've already installed Node.js and elasticsearch)

        npm install

    __2. Start the app__
        grunt
        


Architecture
------------
Mad Galaxy is a network of content aggregation sites called 'planets'. Each
planet site covers a specific topic like Ruby on Rails, BackBone.js,
Angular.js, or Node.js, for example.

At the core is a content aggregator called Supernova. It reads from a list of
content sources, like blogs (and hopefully in the future: twitter feeds, dribble feeds, etc)
and fetches content from each source on a specified interval. It then emits content items from each
source internally where each item is parsed, classified, tagged, and possibly
scored.

After that, content is categorized, indexed, and stored into MongoDB + ElasticSearch. 
Each planet site can subscribe to certain tags emitted from the Supernova and make a query for full-text-search, 
along with many other things. Basically, the supernova is an API, and each planet can make requests to it.

![ Mad Galaxy diagram ](https://raw.githubusercontent.com/madgloryint/madgalaxy/master/docs/mad_galaxy_sketch.jpg)

Use
---
--Articles

    GET /api/v1/articles - Retreives the latest articles
        parameters:
            ?pageNum - Page number. 
                       Defaults to 1. 
                       Not required.
            ?perPage - Number of articles per page. 
                       Defaults to 10. 
                       Not required.


    GET /ap/v1/articles/id/:article_id - Retreives article by id
        parameters:
            :article_id - _id of article. 
                          Required.


    GET /api/v1/articles/tags/:tags - Finds all articles with :tags (inclusive, not exclusive)
        parameters:
            :tags    -  A list of tags separated by +'s (example: angularjs+node). 
                        Usable tags can be found at /api/v1/articles/tags.
                        Required.
            ?pageNum -  Page number. 
                        Defaults to 1. 
                        Not required.
            ?perPage -  Number of articles per page. 
                        Defaults to 10. 
                        Not required.


    GET /api/v1/articles/tags/untagged - Finds all articles where article.tags = []
        parameters:
            ?pageNum - Page number. 
                       Defaults to 1. 
                       Not required.
            ?perPage - Number of articles per page. 
                       Defaults to 10. 
                       Not required.


--Tags

    GET /api/v1/tags - Gets a list of 1st level tags and 2nd level tags
        No parameters


    DELETE /api/v1/tags - Deletes tag 
        parameters:
            tag - The tag to be deleted.
                  Required.


    PUT /api/v1/tags - Creates a tag
        parameters:
            tag          -  The 1st level tag to be created.
                            Required.

            tag_varients -  2nd level tags to be associated with 1st level tag
                            Required


--Search

    GET /api/v1/search/ - Searches for articles with ?searchString and ?searchTag
        parameters:
            ?searchString - Full text search string.
                            Required.

            ?searchTag    - Filters above search with tags separated by +'s (inclusive, not exclusive)
                            Not Required.

            ?pageNum      - Page number. 
                            Defaults to 1. 
                            Not required.

            ?perPage      - Number of articles per page. 
                            Defaults to 10. 
                            Not required.

Debugging
---------
This application uses 'debug', a library to help manage errors and logs that 
are outputted to the console. There are mutiple 'debug' groups in this 
application that can be selectivley turned on or off.

Here are is a list of all current debug groups:

- feedreader:feedparser
- feedreader:articleParser
- feedreader:elasticsearch
- api_v1
- router:api_v1
- router:basic
- router:error_handler
- taggingSystem
- server

Currenlty, which debug groups that are outputted to the console is determined by the startup script
in package.json or a task in grunt depending on how you are running the app.

Here is where you configure 'debug' if you start the app with 'npm start':
```
// ./package.json
  "scripts": {
    "start": "DEBUG=server,feedreader:*,api_v1,router:* ./node_modules/.bin/supervisor ./bin/www", <-----this line
    "test": "./node_modules/.bin/mocha"
  },
```
Here is where you configure 'debug' if you start the app with 'grunt':
```
// Gruntfile.js

dev: {
    NODE_ENV: 'development',
    DEST: 'temp',
    DEBUG: 'server,feedreader:*,api_v1,router:*' <------this line
}
```

If a debug group is included in the DEBUG variable, it is logged to the console, and if it is excluded,
it is not logged to the console.

Here is some more documentation on debug: https://github.com/visionmedia/debug




Meta
----
Conceived and built at [MadGlory](http://madglory.com) in [Saratoga Springs, NY](https://www.google.com/maps/place/Saratoga+Springs,+NY/@43.0616419,-73.7719178,13z/).
