const express = require('express'); // Express web server framework
const request = require('request'); // "Request" library
const cors = require('cors');
const querystring = require('querystring');
const cookieParser = require('cookie-parser');
const fs = require('fs');
const fetch = require('node-fetch');
const bodyParser = require('body-parser')

const client_id = '2538eb4cf1e44053b1c1d5f6c5ba861e'; // Your client id // Mine -> 2538eb4cf1e44053b1c1d5f6c5ba861e
const client_secret = 'e4288b338d6b4d71acaf8addbe060b89'; // Your secret // Mine -> e4288b338d6b4d71acaf8addbe060b89
const img = require('./img')

const astro = require("aztro-js")
const horoscope = require('horoscope')
const SpotifyWebApi = require('spotify-web-api-node');
const spotify = new SpotifyWebApi();

const website = 'http://localhost:3000'
const server = 'http://localhost:8888'

/**
Here are variables that are hard-coded. If you pass from the form to these 3, that's the end.
// **/
let user
let country

let port = process.env.PORT || '8888';
const redirect_uri = `${server}/callback/`; // Your redirect uri

async function shuffle(array) {
  let m = array.length,
    t, i
  while (m) {
    i = Math.floor(Math.random() * m--)
    t = array[m]
    array[m] = array[i]
    array[i] = t
  }
  return array
}

function chooseImage(sign) {
  let zod = {}
  switch (sign) {
    case 'Aquarius':
      zod.image = img.aquarius;
      zod.emoji = '0x2652'
      break;
    case 'Pisces':
      zod.image = img.pisces;
      zod.emoji = '0x2653'
      break;
    case 'Aries':
      zod.image = img.aries;
      zod.emoji = '0x2648'
      break;
    case 'Taurus':
      zod.image = img.taurus;
      zod.emoji = '0x2649'
      break;
    case 'Gemini':
      zod.image = img.gemini;
      zod.emoji = '0x264A'
      break;
    case 'Cancer':
      zod.image = img.cancer;
      zod.emoji = '0x264B'
      break;
    case 'Leo':
      zod.image = img.leo;
      zod.emoji = '0x264C'
      break;
    case 'Virgo':
      zod.image = img.virgo;
      zod.emoji = '0x264D'
      break;
    case 'Libra':
      zod.image = img.libra;
      zod.emoji = '0x264E'
      break;
    case 'Scorpio':
      zod.image = img.scorpio;
      zod.emoji = '0x264F'
      break;
    case 'Sagittarus':
      zod.image = img.sagittarus;
      zod.emoji = '0x2650'
      break;
    case 'Capricorn':
      zod.image = img.capricorn;
      zod.emoji = '0x2651'
      break;
  }
  return zod;
}

async function uploadCoverImage(playlistId, accessToken, base64) {
  fetch(`https://api.spotify.com/v1/playlists/${playlistId}/images`, {
      method: "PUT",
      mode: "cors",
      cache: "no-cache",
      headers: {
        "Content-Type": "image/jpeg",
        "Authorization": `Bearer ${accessToken}`
      },
      body: base64, // eg. '/9j/....'
    })
    .then((res) => {
      console.log(res)
    })
    .catch((err) => {
      console.error(err)
    })
}

async function go(month, day, userSpotifyId, token, name) {
  let settings = {};
  let list;
  let key = token;
  let sign = horoscope.getSign({
    month: month,
    day: day
  })
  let fortune;
  let cover = chooseImage(sign)
  // console.log(cover)

  await astro.getAllHoroscope(sign, async function (res) {
    settings = {
      limit: 20,
      offset: parseInt(res.today.lucky_number)
    };

    fortune = res.today.description;

    // Get top tracks
    let range_options = ['short_term', 'medium_term', 'long_term'];
    let range = range_options[Math.floor(Math.random() * range_options.length--)]
    let topTracks = [] // full list of top tracks

    await spotify.getMyTopTracks({
        limit: settings.limit,
        offset: settings.offset,
        time_range: range
      })
      .then(async function (res) {
        if (res.body.items.length == 0) {
          let ran = Math.floor(Math.random() * settings.limit--)

          await spotify.getMyTopTracks({
              limit: settings.limit,
              offset: ran,
              time_range: range
            })
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

    for (i = 0; i < 5; i++) {
      shorter.push(topTracks[i].id)
      shorter_uri.push(topTracks[i].uri)
    }

    await spotify.getRecommendations({ // get recommendations
        seed_tracks: shorter,
        limit: (settings.limit - 5)
      })
      .then(function (res) {
        for (let item of res.body.tracks) {
          playlist.push(item.uri)
        }
        for (let item of shorter_uri) {
          playlist.push(item)
        }
        shuffle(playlist)
      }).catch(function (err) {
        console.error(err);
      })

    await spotify.createPlaylist( // create a new playlist
        userSpotifyId,
        `For ${name} by Astrofy`, {
          'public': true,
          'description': `${String.fromCodePoint(cover.emoji)} ${sign.toUpperCase()}: ${fortune}`
        })
      .then(async function (res) {
          uploadCoverImage(res.body.id, key, cover.image)
          await spotify.addTracksToPlaylist(res.body.id, playlist) // add tracks to playlist
            .catch((err) => {
              console.error(err)
            })
        },
        function (err) {
          console.error(err)
        });
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
var generateRandomString = function (length) {
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
  .use(cookieParser())
  .use(bodyParser.json())
  .use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", website); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

app.get('/login', function (req, res) {
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

app.get('/callback', function (req, res) {

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
        'Authorization': 'Basic ' + (new Buffer.from(client_id + ':' + client_secret).toString('base64'))
      },
      json: true
    };

    request.post(authOptions, function (error, response, body) {
      if (!error && response.statusCode === 200) {

        var access_token = body.access_token,
          refresh_token = body.refresh_token;

        var options = {
          url: 'https://api.spotify.com/v1/me',
          headers: {
            'Authorization': 'Bearer ' + access_token
          },
          json: true
        };

        // use the access token to access the Spotify Web API
        request.get(options, function (error, response, body) {
          user = body.user;
          country = body.country

          return (user, country)
        });
        console.log(user, country)
        // we can also pass the token to the browser to make requests from there
        res.redirect(`${website}/#` +
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

app.get('/refresh_token', function (req, res) {

  // requesting access token from refresh token
  var refresh_token = req.query.refresh_token;
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: {
      'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
    },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    },
    json: true
  };

  request.post(authOptions, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      var access_token = body.access_token;
      res.send({
        'access_token': access_token
      });
    }
  });
});

console.log(`Listening on ${port}`);
app.listen(port);
