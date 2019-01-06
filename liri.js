/*** /liri.js
***/


// require
require( 'dotenv' ).config();
var keys = require( './keys' );
var fs = require( 'fs' );
var request = require( 'request' );
var moment = require( 'moment' );
var Spotify = require('node-spotify-api');


// console.log();
// console.log( '# Command line arguments' );
// console.log( 'process.argv :' , process.argv );


/*** FUNCTION doConcertThis
***/

doConcertThis = function( artistName ) {
    // console.log();
    // console.log( '# Command \'concert-this\' ' );
    // console.log( 'artistName :' , artistName );

    // clean artist name
    artistName = artistName.trim();

    // check if artist name is missing
    if ( !artistName ) {
        console.log();
        console.log( 'Please provide an artist name!' );
        return;
    }

    // call Bandsintown API
    var url = `https://rest.bandsintown.com/artists/${ encodeURIComponent( artistName ) }/events?app_id=${ keys.BANDSINTOWN_APP_ID }`;
    // console.log( 'url :' , url );
    request(
        url ,
        ( error , response , body ) => {
            // check if API error
            if ( error ) {
                console.log();
                console.log( error );
                return;
            }

            // check if no events
            if ( body === '{warn=Not found}\n' ) {
                console.log();
                console.log( 'There are no upcoming events :(' );
                return;
            }

            // display the first 10 events
            events = JSON.parse( body );
            events.splice( 10 );

            console.log();
            console.log( `${ artistName }'s upcoming events:` );
            console.log();
            events.forEach(
                ( event , eventIndex ) => {
                    var date = '';
                    if ( event.datetime ) {
                        date = `${ moment( event.datetime ).format( 'MM/DD/YYYY' ) } in `;
                    }

                    var location = '';
                    if ( event.venue.city ) {
                        location += event.venue.city;
                    }
                    if ( event.venue.city && event.venue.region ) {
                        location += ', ';
                    }
                    if ( event.venue.region ) {
                        location += event.venue.region;
                    }
                    if ( ( event.venue.city || event.venue.region ) && event.venue.country ) {
                        location += ', ';
                    }
                    if ( event.venue.country ) {
                        location += event.venue.country;
                    }

                    var venue = '';
                    if ( event.venue.name ) {
                        venue = ` at ${ event.venue.name }`;
                    }

                    var description = `${ date }${ location }${ venue }`;
                    console.log( description );
                }
            );
        }
    );
}


/*** FUNCTION doSpotifyThisSong
***/

doSpotifyThisSong = function( songName ) {
    // console.log();
    // console.log( '# Command \'spotify-this-song\' ' );
    // console.log( 'songName :' , songName );

    // clean song name
    songName = songName.trim();

    // check if song name is missing
    if ( !songName ) {
        console.log();
        console.log( 'Please provide a song name!' );
        return;
    }

    // call Spotify API
    var spotify = new Spotify(
        {
            id : keys.SPOTIFY_ID ,
            secret : keys.SPOTIFY_SECRET
        }
    );
    spotify.search( { type: 'track' , query: songName , limit : 10 } )
    .then(
        ( response ) => {
            // check if no tracks
            if ( response.tracks.total === 0 ) {
                console.log();
                console.log( 'I don\'t know that song :(' );
                return;
            }

            console.log();
            console.log( 'Songs with that name:' );
            response.tracks.items.forEach(
                ( item , itemIndex ) => {
                    var artists = [];
                    item.artists.forEach(
                        ( artist , artistIndex ) => {
                            artists.push( artist.name );
                        }
                    );
                    console.log();
                    console.log( `Artist(s): ${ artists.join() }` );
                    console.log( `Song: ${ item.name }` );
                    console.log( `Album: ${ item.album.name }` );
                    console.log( `Spotify preview: ${ item.preview_url }` );
                }
            );
        }
    )
    .catch(
        ( error ) => {
            console.log();
            console.log( error );
            return;
        }
    );
}

/*** FUNCTION doMovieThis
***/

doMovieThis = function( movieName ) {
    // console.log();
    // console.log( '# Command \'movie-this\' ' );
    // console.log( 'movieName :' , movieName );

    // clean song name
    movieName = movieName.trim();

    // check if song name is missing
    if ( !movieName ) {
        console.log();
        console.log( 'Please provide a movie name!' );
        return;
    }

    // call OMDB API
    var url = `http://www.omdbapi.com/?apikey=${ keys.OMDB_API_KEY }&t=${ encodeURIComponent( movieName ) }`;
    // console.log( 'url :' , url );
    request(
        url ,
        ( error , response , body ) => {
            // check if API error
            if ( error ) {
                console.log();
                console.log( error );
                return;
            }

            movie = JSON.parse( body );

            // check if no events
            if ( movie.error ) {
                console.log();
                console.log( 'I don\'t know that movie :(' );
                return;
            }

            console.log();
            console.log( 'Movie with that name:' );
            console.log();
            console.log( `Title: ${ movie.Title }` );
            console.log( `Year: ${ movie.Year }` );
            movie.Ratings.forEach(
                ( rating , ratingIndex ) => {
                    if ( rating.Source === 'Internet Movie Database' ) {
                        console.log( `IMDB rating: ${ rating.Value }` );
                    }
                    if ( rating.Source === 'Rotten Tomatoes' ) {
                        console.log( `Rotten Tomatoes rating: ${ rating.Value }` );
                    }
                }
            );
            console.log( `Country: ${ movie.Country }` );
            console.log( `Language: ${ movie.Language }` );
            console.log( `Plot summary: ${ movie.Plot }` );
            console.log( `Actors: ${ movie.Actors }` );
        }
    );
}


/*** FUNCTION doWhatItSays
***/

doWhatItSays = function() {
    fs.readFile(
        'random.txt' , 'utf8' ,
        ( error , data ) => {
            // check if error
            if ( error ) {
                console.log( error );
                return;
            }

            // split data by lines
            var data = data.split( '\n' );
            var commandAndParameterA = [];
            data.forEach(
                ( element , index ) => {
                    // ignore empty lines
                    if ( !element ) {
                        return;
                    }

                    // split line into command and command parameter
                    var commandAndParameter = element.split( ',' );

                    // ignore invalid commands
                    if (
                        commandAndParameter[ 0 ] !== 'concert-this' &&
                        commandAndParameter[ 0 ] !== 'spotify-this-song' &&
                        commandAndParameter[ 0 ] !== 'movie-this'
                    ) {
                        return;
                    }

                    // remove quotes of command parameter
                    commandAndParameter[ 1 ] = commandAndParameter[ 1 ].slice( 1 , -1 );
                    commandAndParameterA.push( commandAndParameter );
                }
            );

            // console.log();
            // console.log( '# Commands');
            // console.log( 'commandAndParameterA :' , commandAndParameterA );

            commandAndParameterA.forEach(
                ( commandAndParameter , commandIndex ) => {
                    main( commandAndParameter[ 0 ] , commandAndParameter[ 1 ] );
                }
            )
        }
    );
}


/*** FUNCTION doHelp
***/

doHelp = function() {
    // console.log();
    // console.log( '# Command \'help\' ' );
    console.log();
    console.log( 'Sorry, I do not understand what you are asking for :(' );
    console.log();
    console.log( 'I understand the following commands:' );
    console.log( '    concert-this "Artist Name"' );
    console.log( '        I will look for the artist\'s upcoming concerts in Bandsintown.' );
    console.log( '    spotify-this-song "Song Name"' );
    console.log( '        I will look for song details in Spotify.' );
    console.log( '    movie-this "Movie Name"' );
    console.log( '        I will look for movie details in OMDB.' );
    console.log( '    do-what-it-says' );
    console.log( '        I will run the commands in file \'random.txt\'.' );
    console.log();
    console.log( 'Make sure to use double quotes around the artist, song and movie names!' );
}


/*** FUNCTION main()
***/

main = function( command , commandParameter ) {
    // Check Command
    if ( command === 'concert-this' ) {
        doConcertThis( commandParameter );
    }
    else if ( command === 'spotify-this-song' ) {
        doSpotifyThisSong( commandParameter );
    }
    else if ( command === 'movie-this' ) {
        doMovieThis( commandParameter );
    }
    else if ( command === 'do-what-it-says' ) {
        doWhatItSays( commandParameter );
    }
    else {
        doHelp();
    }
}


// Get arguments
var command = process.argv[ 2 ];
var commandParameter = process.argv[ 3 ];

main( command , commandParameter );
