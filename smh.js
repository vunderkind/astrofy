/**
 * This is an example of a basic node.js script that performs
 * the Authorization Code oAuth2 flow to authenticate against
 * the Spotify Accounts.
 *
 * For more information, read
 * https://developer.spotify.com/web-api/authorization-guide/#authorization_code_flow
 */

const express = require('express'); // Express web server framework
const request = require('request'); // "Request" library
const cors = require('cors');
const querystring = require('querystring');
const cookieParser = require('cookie-parser');
const fs = require('fs');
const fetch = require('node-fetch');

const client_id = '2538eb4cf1e44053b1c1d5f6c5ba861e'; // Your client id
const client_secret = 'e4288b338d6b4d71acaf8addbe060b89'; // Your secret
const redirect_uri = 'http://localhost:8888/callback/'; // Your redirect uri

const astro = require("aztro-js")
const horoscope = require('horoscope')
const SpotifyWebApi = require('spotify-web-api-node');
const spotify = new SpotifyWebApi ();

/**
Buffer
**/
let img = fs.readFileSync('image.png').toString('base64')

/**
GENERATOR
**/
async function shuffle(array) {
  let m = array.length, t, i
  while (m) {
    i = Math.floor(Math.random() * m--)
    t = array[m]
    array[m] = array[i]
    array[i] = t
  }
  return array
}

async function coverImage (playlistId, token, base64) {
  fetch(`https://api.spotify.com/v1/playlists/${playlistId}/images`, {
    method: "PUT",
    mode: "cors",
    cache: "no-cache",
    headers: {
      "Content-Type": "image/jpeg",
      "Authorization": `Bearer ${token}`
    },
    body: base64, // eg. '/9j/....'
  })
}

// uploadCoverImage: async function (playlistId, accessToken, base64) {
//     try {
//       return fetch(`https://api.spotify.com/v1/playlists/${playlistId}/images`, {
//         method: "PUT",
//         mode: "cors",
//         cache: "no-cache",
//         headers: {
//           "Content-Type": "image/jpeg",
//           "Authorization": `Bearer ${accessToken}`
//         },
//         body: base64, // eg. '/9j/....'
//       })
//     } catch (e) {
//       return {error: e}
//     }
//   },

async function go (month, day, token, image) {
  let settings = {};
  let list;
  let key = token;
  let img = image;
  await astro.getAllHoroscope(horoscope.getSign({month: month, day: day}), async function (res) {
    settings = {limit: 10, offset: parseInt(res.today.lucky_number)}

    // Get top tracks
    let range_options = ['short_term', 'medium_term', 'long_term']
    let range = range_options[Math.floor(Math.random() * range_options.length--)]
    let topTracks = [] // full list of top tracks
    await spotify.getMyTopTracks({limit:20, offset: settings.offset, time_range: range})
    .then(async function (res) {
      if (res.body.items.length == 0) {
        await spotify.getMyTopTracks({limit:20, offset: 10, time_range: range})
        .then(function (res) {
          for (let item of res.body.items) {
            let e = {}
            e = {
              id: item.id,
              uri: item.uri
            }
            topTracks.push(e)
          }
        })
      } else {
        for (let item of res.body.items) {
          let e = {}
          e = {
            id: item.id,
            uri: item.uri
          }
          topTracks.push(e)
        }
      }
    }).catch(function (err) {
      console.error(err);
    })
    shuffle(topTracks)
    let shorter = [] // seed list
    let shorter_uri = []
    let playlist = [] // empty playlist
    let playlist_id
    for (i = 0; i < 5; i++) {
      shorter.push(topTracks[i].id)
      shorter_uri.push(topTracks[i].uri)
    }
    await spotify.getRecommendations({seed_tracks: shorter, limit: 15})
    .then(function (res) {
      for (let item of res.body.tracks) {
        playlist.push(item.uri)
      }
      for (let item of shorter_uri) {
        playlist.push(item)
      }
      shuffle(playlist)
      console.log('Playlist: ', playlist)
    }).catch(function (err) {
      console.error(err);
    })
    await spotify.createPlaylist('11160978767', 'Astrofy 5', {'public': false, 'description': 'This is a brand new playlist!'})
    .then(async function(res) {
      await spotify.addTracksToPlaylist(res.body.id, playlist)
      .then(function (){
        list = res.body.id
      })
      .catch((err) => {console.error(err)} )
    }, function(err) {
      console.log('Something went wrong!', err);
    });
    await coverImage(playlist, key, img)
    .catch((err) => { console.error(err) })
  })
}


/**
CONNECTOR
**/
/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

var stateKey = 'spotify_auth_state';

var app = express();

app.use(express.static(__dirname + '/public'))
   .use(cors())
   .use(cookieParser());

app.get('/login', function(req, res) {

  var state = generateRandomString(16);
  res.cookie(stateKey, state);

  // your application requests authorization
  var scope = 'ugc-image-upload user-read-private playlist-read-collaborative playlist-modify-public playlist-read-private playlist-modify-private user-library-read user-top-read';
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state
    }));
});

app.get('/callback', function(req, res) {

  // your application requests refresh and access tokens
  // after checking the state parameter

  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
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
        'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
      },
      json: true
    };

    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {

        var access_token = body.access_token,
            refresh_token = body.refresh_token;
            console.log('Access token: ', access_token, 'Refresh token: ', refresh_token)

        var options = {
          url: 'https://api.spotify.com/v1/me',
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };

        // use the access token to access the Spotify Web API
        request.get(options, function(error, response, body) {
          // console.log(access_token)
          console.log(body);
          spotify.setAccessToken(access_token);
          go(6, 30, access_token, img)
        });

        // we can also pass the token to the browser to make requests from there
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



app.get('/refresh_token', function(req, res) {

  // requesting access token from refresh token
  var refresh_token = req.query.refresh_token;
  console.log(refresh_token)
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: { 'Authorization': 'Basic ' + (new Buffer.from(client_id + ':' + client_secret).toString('base64')) },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    },
    json: true
  };

  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      var access_token = body.access_token;
      res.send({
        'access_token': access_token
      });
    }
  });
});

app.get('/', (req,res)=> {
  res.send(`<img src="https://media.giphy.com/media/izyPeqoh2k5GBaEonV/giphy.gif" alt='image'/>`)
})

console.log('Listening on 8888');
app.listen(8888);