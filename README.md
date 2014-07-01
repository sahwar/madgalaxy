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
planet site covers a specific topic like Ruby on Rails, Responsive Web Design,
Angular.js, or Typography, for example.

At the core is a content aggregator called Supernova. It reads from a list of
content sources, like blogs, Twitter feeds, or Dribble, and fetches content
from each source on a specified interval. It then emits content items from each
source internally where each item is parsed, classified, tagged, and possibly
scored.

After that, content is emitted out to the planet sites, as well as persisted to
storage for query later (CouchDB is pretty good for that). Each planet site can
handle and display incoming content however it wishes, and can subscribe to
certain tags emitted from the Supernova. Planets may also directly query the
CouchDB database for documents it might be interested in, which is just as good
as an API.

![Mad Galaxy diagram](https://raw.githubusercontent.com/madgloryint/madgalaxy/master/docs/mad_galaxy_sketch.jpg)

Meta
----
Conceived and built at [MadGlory](http://madglory.com) in [Saratoga Springs, NY](https://www.google.com/maps/place/Saratoga+Springs,+NY/@43.0616419,-73.7719178,13z/).

