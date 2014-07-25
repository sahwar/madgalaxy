Mad Galaxy
==========

A galaxy of software solar systems and planets.

Development
-----------
To run this on your own machine*:

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

After that, content is emitted out to the planet sites, as well as persisted to
storage for query later (CouchDB is pretty good for that). Each planet site can
handle and display incoming content however it wishes, and can subscribe to
certain tags emitted from the Supernova. Planets may also directly query the
CouchDB database for documents it might be interested in, which is just as good
as an API.

![ Mad Galaxy diagram ](https://raw.githubusercontent.com/madgloryint/madgalaxy/master/docs/mad_galaxy_sketch.jpg)

Use
---
--Articles

    GET /api/v1/articles - Retreives the latest articles
        parameters:
            ?pageNum - Page number. 
                       Defaults to 1. 
                       Not required.


    GET /ap/v1/articles/id/:article_id - Retreives article by id
        parameters:
            :article_id - _id of article. 
                          Required.


    GET /api/v1/articles/tags/:tags - Finds all articles with :tags (inclusive, not exclusive)
        parameters:
            :tags -     A list of tags separated by +'s (example: angularjs+node). 
                        Usable tags can be found at /api/v1/articles/tags.
                        Required.
            ?pageNum -  Page number. 
                        Defaults to 1. 
                        Not required.


    GET /api/v1/articles/tags/untagged - Finds all articles where article.tags = []
        parameters:
            ?pageNum - Page number. 
                       Defaults to 1. 
                       Not required.
            ?pageNum - Page number. 
                       Defaults to 1. 
                       Not required.f


--Tags

    GET /api/v1/tags - Gets a list of 1st level tags and 2nd level tags
        No parameters


    DELETE /api/v1/tags - Deletes tag 
        parameters:
            tag - The tag to be deleted.
                  Required.


    PUT /api/v1/tags - Creates a tag
        parameters:
            tag -           The 1st level tag to be created.
                            Required.
            tag_varients -  2nd level tags to be associated with 1st level tag
                            Required


--Search

    GET /api/v1/search/ - Searches for articles with ?searchString and ?searchTag
        parameters:
            ?searchString - Full text search string.
                            Required.
            ?searchTag -    Filters above search with tags separated by +'s (inclusive, not exclusive)
                            Not Required.
            ?pageNum -      Page number. 
                            Defaults to 1. 
                            Not required.



Meta
----
Conceived and built at [MadGlory](http://madglory.com) in [Saratoga Springs, NY](https://www.google.com/maps/place/Saratoga+Springs,+NY/@43.0616419,-73.7719178,13z/).
