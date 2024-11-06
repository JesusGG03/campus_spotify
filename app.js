require('dotenv').config();
const express = require('express');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const request = require('request');
const crypto = require('crypto');
const querystring = require('querystring');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const { error } = require('console');
const { url } = require('inspector');
const path = require('path')
const { Pool } = require('pg');


var client_id = process.env.CLIENT_ID; // your clientId
var client_secret = process.env.CLIENT_SECRET; // Your secret
var redirect_uri = process.env.REDIRECT_URI; // Your redirect uri


const keywordMappings = {
    'k-pop': 'k-pop',
    'hip hop': 'hip hop',
    'rap': 'rap',
    'trap': 'trap',
    'r&b': 'r&b',
    'pop': 'pop',
    'metalcore': 'metalcore',
    'indie': 'indie',
    'metal': 'metal',
    'rock': 'rock',
    'phonk': 'phonk',
    'j-pop': 'j-pop',
    'soul': 'soul'
}


function mapGenre(genres){
    for(const keyword in keywordMappings){
        const regex = new RegExp(`\\b${keyword}\\b`, 'i')
        if(regex.test(genres)){
            return keywordMappings[keyword];
        }
    }

    return genres;
}


const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});



async function insertTracks(trackName, artistName, imageURL) {
    const client = await pool.connect();

    try{
        await client.query('BEGIN');

        await client.query(`
            INSERT INTO tracks (track_name, artist_name, image_url) VALUES ($1, $2, $3)
            `, [trackName, artistName, imageURL]);

        await client.query('COMMIT');

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error inserting tracks: ', error);
    } finally {
        client.release();
    }
    
}

async function insertArtists(artistName, artistImg) {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        await client.query(`
            INSERT INTO artists (artist_name, artist_img) VALUES ($1, $2)
            `, [artistName, artistImg]);

        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error inserting artists: ', error);
    } finally {
        client.release();
    }
    
}

async function insertGenres(genreName, genreCount) {
    const client = await pool.connect();

    try{
        await client.query('BEGIN');

        await client.query(`
            INSERT INTO genres (genre_name, genre_count) VALUES ($1, $2)
            `, [genreName, genreCount]);
        
        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error inserting genres: ', error);
    } finally {
        client.release();
    }

}





const generateRandomString = (length) => {
return crypto
.randomBytes(60)
.toString('hex')
.slice(0, length);
}


var stateKey = 'spotify_auth_state';

const app = express()


app.use(session({
    store: new pgSession({
        pool: pool, 
        tableName: 'session', // Table to store session data
    }),
    secret: process.env.SESSION_SECRET, 
    resave: false, 
    saveUninitialized: false, 
    cookie: { 
        secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
          httpOnly: true, // Helps mitigate cross-site scripting attacks
        maxAge: 60 * 60 * 1000 // Cookie expiration in milliseconds (e.g., 1 hour)
    }
}));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

app.use(express.static(__dirname + '/public'))
    .use(cors())
    .use(cookieParser());




app.get('/login', function(req, res) {

    var state = generateRandomString(16);
    res.cookie(stateKey, state);

    // your application requests authorization
    var scope = 'user-top-read user-follow-read';
    res.redirect('https://accounts.spotify.com/authorize?' +
        querystring.stringify({
        response_type: 'code',
        client_id: client_id,
        scope: scope,
        redirect_uri: redirect_uri,
        state: state
        }));
    });


app.get('/callback', function(req, res){

    // app will request refresh and access token after checking the state parameter

    var code = req.query.code || null ;
    var state = req.query.state || null;
    var storedState = req.cookies ? req.cookies[stateKey] : null;

    if(state === null || state !== storedState) {

        res.redirect('/#' +
            querystring.stringify({
                error: 'state_mismatch'
            }));

    } else {

        res.clearCookie(stateKey);
        var authOptions = {
            url: 'https://accounts.spotify.com/api/token',
            form: {
                code: code,
                redirect_uri: redirect_uri,
                grant_type: 'authorization_code'
            },
            headers: {
                'content-type': 'application/x-www-form-urlencoded',
                Authorization: 'Basic ' + (new Buffer.from(client_id + ':' + client_secret).toString('base64'))
            },
            json: true
        };

        request.post(authOptions, function(error, response, body) {
            if(!error && response.statusCode === 200){

                var access_token = body.access_token,
                refresh_token = body.refresh_token;
                req.session.accessToken = access_token;

                var options = {
                    url: 'https://api.spotify.com/v1/me/top/tracks?time_range=medium_term&limit=30&offset=0',
                    headers: { Authorization: 'Bearer ' + access_token },
                    json: true
                };
            
                request.get(options, function(error, response, body) {
                    if (!error && response.statusCode === 200) {
                        const topTracks = body.items;
                        for (const track of topTracks){
                            const trackName = track.name;
                            const artistName = track.artists.map(artist => artist.name).join(', ');
                            const imageUrl = track.album.images[0]?.url
            
                            insertTracks(trackName, artistName, imageUrl);
                        }
                        

                    } else {
                        console.error('Error fetching top tracks:', error);
                        console.error('Response status code:', response.statusCode);
                        console.error('Response body:', body); // Log the body for error response
                    }
                });


                options = {
                    url: 'https://api.spotify.com/v1/me/top/artists?time_range=long_term&limit=5&offset=0',
                    headers: { Authorization: 'Bearer ' + access_token},
                    json: true
                };
            
                request.get(options, function(error, response, body){
                    if(!error && response.statusCode === 200){
                        const topArtists = body.items;
                        for (const artist of topArtists) {
                            const artistName = artist.name;
                            const artistImg = artist.images[0]?.url;
            
                            insertArtists(artistName, artistImg);
                        }

                    } else {
                        console.error('Error fetching artists: ', error);
                        res.status(response.statusCode).json({error: 'Failed to fetch top Artists'});
                    }
                });

                options = {
                    url: 'https://api.spotify.com/v1/me/top/artists?time_range=long_term&limit=50&offset=0',
                    headers: { Authorization: 'Bearer ' + access_token},
                    json: true
                };
            
                request.get(options, function(error, response, body){
                    if(!error && response.statusCode === 200){
                        
                        const genresList = body.items.flatMap(artist => artist.genres);
                        const genreCounts = {};
            
                        genresList.forEach(genre => {
                            const mappedGenre = mapGenre(genre);
            
                            genreCounts[mappedGenre] = (genreCounts[mappedGenre] || 0) + 1;
                        });
            
            
                        const sortedGenres = Object.entries(genreCounts)
                            .sort(([, countA], [, countB]) => countB - countA);
            
                        sortedGenres.forEach(([genreName, genreCount]) => {
                            insertGenres(genreName, genreCount);
                        });
                        
            
                    } else {
                        console.error('Error fetching artists: ', error);
                        res.status(response.statusCode).json({error: 'Failed to fetch Top Artists'})
                    }
                });
                

                res.redirect('/#' + 
                    querystring.stringify({
                        access_token: access_token,
                        refresh_token: refresh_token
                    }));    

            } else {
                res.redirect('/#' +
                    querystring.stringify({
                        error: 'invalid_token'
                    }));
            }
        });
    }
});



app.get('/user-top-tracks', function(req, res) {
    // Retrieve the access token from the session
    const accessToken = req.session.accessToken;

    if (!accessToken){
        return res.status(401).json({ error: 'Access token missing or expired' });
    }

    const options = {
        url: 'https://api.spotify.com/v1/me/top/tracks?time_range=medium_term&limit=30&offset=0',
        headers: { Authorization: 'Bearer ' + accessToken },
        json: true
    };

    request.get(options, function(error, response, body) {
        if (!error && response.statusCode === 200) {
            const topTracks = body.items;
            


            res.json(body.items); // Send the top tracks back to the client
        } else {
            console.error('Error fetching top tracks:', error);
            res.status(response.statusCode).json({ error: 'Failed to fetch top tracks' });
        }
    });
});


app.get('/user-top-artist', function(req, res){
    const access_token = req.session.accessToken;

    if(!access_token){
        return res.status(401).json({error: 'Access token missing or expired'});
    }

    const options = {
        url: 'https://api.spotify.com/v1/me/top/artists?time_range=long_term&limit=5&offset=0',
        headers: { Authorization: 'Bearer ' + access_token},
        json: true
    };

    request.get(options, function(error, response, body){
        if(!error && response.statusCode === 200){
            


            res.json(body.items);
        } else {
            console.error('Error fetching artists: ', error);
            res.status(response.statusCode).json({error: 'Failed to fetch top Artists'});
        }
    });
});


app.get('/user-genres', function(req, res){
    const access_token = req.session.accessToken;

    if(!access_token){
        return res.status(401).json({error: 'Access token muissing or expired'});
    }

    const options = {
        url: 'https://api.spotify.com/v1/me/top/artists?time_range=long_term&limit=50&offset=0',
        headers: { Authorization: 'Bearer ' + access_token},
        json: true
    };

    request.get(options, function(error, response, body){
        if(!error && response.statusCode === 200){
            
            const genresList = body.items.flatMap(artist => artist.genres);
            const genreCounts = {};

            genresList.forEach(genre => {
                const mappedGenre = mapGenre(genre);

                genreCounts[mappedGenre] = (genreCounts[mappedGenre] || 0) + 1;
            });


            const sortedGenres = Object.entries(genreCounts)
                .sort(([, countA], [, countB]) => countB - countA);

            

            const topTenGenres = sortedGenres.slice(0,10);

            const othersGenres = sortedGenres.slice(10).reduce((acc, [, count]) => acc + count, 0);

            const topGenresData = Object.fromEntries(topTenGenres);
            if(othersGenres > 0){
                topGenresData["Others"] = othersGenres;
            }

            

            res.json(topGenresData)
        } else {
            console.error('Error fetching artists: ', error);
            res.status(response.statusCode).json({error: 'Failed to fetch Top Artists'})
        }
    });
});


app.get('/refresh_token', function(req, res){
    var refresh_token = req.query.refresh_token;
    var authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        headers: {
            'content-type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + (new Buffer.from(client_id + ':' + client_secret).toString('base64'))
        },
        form: {
            grant_type: 'refresh_token',
            refresh_token: refresh_token
        },
        json: true
    };

    request.post(authOptions, function(error, response, body){
        if(!error && response.statusCode === 200){
            var access_token = body.access_token,
                refresh_token = body.refresh_token;

            console.log("Access Token:", access_token);

            res.send({
                'access_token': access_token,
                'refresh_token': refresh_token
            });
        }
    });
});


app.get('/get-uni-tracks', async (req, res) => {
    const client = await pool.connect();

    try{
        const uniTracks = await client.query('SELECT * FROM tracks ORDER BY track_count DESC LIMIT 5');
        
        res.json(uniTracks.rows);
    } catch (error) {
        console.error('Error fetching university tracks: ', error);
        res.status(500).json({ error: 'Failed to fetch university tracks'});
    }finally {
        client.release(); // Release client in finally block
    }
});


app.get('/get-uni-artists', async (req, res) => {
    const client = await pool.connect();

    try{
        const uniArtist = await client.query('SELECT * FROM artists ORDER BY artist_count DESC LIMIT 5');
        
        res.json(uniArtist.rows);
    } catch (error) {
        console.error('Error fetching university artists: ', error);
        res.status(500).json({ error: 'Failed to fetch university artists'});
    }finally {
        client.release(); // Release client in finally block
    }
});

app.get('/get-uni-genres', async (req, res) => {
    const client = await pool.connect();

    try{
        const uniGenres = await client.query('SELECT * FROM genres');

        const genreCounts = {};


        uniGenres.rows.forEach(genre => {
            const mappedGenre = mapGenre(genre.genre_name);

            genreCounts[mappedGenre] = (genreCounts[mappedGenre] || 0) + genre.genre_count;
        });

        const sortedGenres = Object.entries(genreCounts)
                .sort(([, countA], [, countB]) => countB - countA);


        const topTenGenres = sortedGenres.slice(0,10);

        const othersGenres = sortedGenres.slice(10).reduce((acc, [, count]) => acc + count, 0);

        const topGenresData = Object.fromEntries(topTenGenres);
        if(othersGenres > 0){
            topGenresData["Others"] = othersGenres;
        }

        res.json(topGenresData);
    } catch (error) {
        console.error('Error fetching uiversity genres: ', error);
        res.status(500).json({ error: 'Failed to fetch university genres'});
    }finally {
        client.release(); // Release client in finally block
    }
});

const port = process.env.PORT || 3000;  // Use Heroku's dynamic port or fall back to 3000 locally
app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});

