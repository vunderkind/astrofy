const express = require('express'); // Express web server framework
const request = require('request'); // "Request" library
const cors = require('cors');
const querystring = require('querystring');
const cookieParser = require('cookie-parser');
const fs = require('fs');
const fetch = require('node-fetch');
const bodyParser = require('body-parser')

const client_id = '2e1627a177104abe9c124cfc3fd0df7e'; // Your client id // Mine -> 2538eb4cf1e44053b1c1d5f6c5ba861e
const client_secret = '4633ef10f541414b905e30ba8763bca6'; // Your secret // Mine -> e4288b338d6b4d71acaf8addbe060b89


const website = 'https://astrofy.live'
const server = 'https://gentle-garden-14638.herokuapp.com/'

let port = process.env.PORT || '8888';
const redirect_uri = `${server}/callback/`; // Your redirect uri


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

app.get('*', function (req, res){
  res.send(`<div style='width:50vw; margin: 0 auto; padding-top: 40px;'><h1 style='text-align:center'>I am alive. What is my purpose?</h1><p>Listen Morty, I hate to break it to you, but what people call “love” is just a chemical reaction that compels animals to breed. It hits hard, Morty, then it slowly fades, leaving you stranded in a failing marriage. I did it. Your parents are gonna do it. Break the cycle, Morty. Rise above. Focus on science.</p><br/> <p>All right, all right, cool it! I see what's happening here. You're both young, you're both unsure about your place in the universe, and you both want to be Grandpa's favorite. I can fix this. Morty, sit here. Summer, you sit here. Now, listen—I know the two of you are very different from each other in a lot of ways, but you have to understand that as far as Grandpa's concerned, you're both pieces of sh*t! Yeah. I can prove it mathematically. Actually, l-l-let me grab my whiteboard. This has been a long time coming, anyways.</p><br/><br/><div style='text-align:center; margin-top:20px;'><img src='https://media.giphy.com/media/Q22kcRdASuBvW/giphy.gif' alt="wubba-lubba-dub-dub"></div></div>`)
})

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
