
const astro = require("aztro-js")
const img = require('./img')
const SpotifyWebApi = require('spotify-web-api-node');
const horoscope = require('horoscope')
const spotify = new SpotifyWebApi();

    //Go function
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
      
      async function uploadCoverImage (playlistId, accessToken, base64) {
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
        .then((res) => {console.log(res)})
        .catch((err) => {console.error(err)})
      }
      
  export default async function go(props) {
        let settings = {};
        spotify.setAccessToken(props.token)
        let list;
        let key = props.token;
        let sign = horoscope.getSign({month: parseInt(props.month), day: parseInt(props.day)})
        console.log(`${props.name} is a ${sign}`)
        let fortune;
        let cover = chooseImage(sign)
        // console.log(cover)
      
        await astro.getAllHoroscope(sign, async function(res) {
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
            .then(async function(res) {
              if (res.body.items.length == 0) {
                let ran = Math.floor(Math.random() * settings.limit--)
      
                await spotify.getMyTopTracks({
                    limit: settings.limit,
                    offset: ran,
                    time_range: range
                  })
                  .then(function(res) {
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
            }).catch(function(err) {
              console.error(err);
            })
      
          shuffle(topTracks)
      
          let shorter = [] // seed list
          let shorter_uri = []
          let playlist = [] // empty playlist
          console.log('Top tracks: ', topTracks)
      
          for (let i = 0; i < 5; i++) {
            shorter.push(topTracks[i].id)
            shorter_uri.push(topTracks[i].uri)
          }
      
          await spotify.getRecommendations({ // get recommendations
              seed_tracks: shorter,
              limit: (settings.limit - 5)
            })
            .then(function(res) {
              for (let item of res.body.tracks) {
                playlist.push(item.uri)
              }
              for (let item of shorter_uri) {
                playlist.push(item)
              }
              shuffle(playlist)
            }).catch(function(err) {
              console.error(err);
            })
            
          await spotify.createPlaylist( // create a new playlist
            props.userSpotifyId,
            `For ${props.name} by Astrofy`, {
              'public': true,
              'description': `${String.fromCodePoint(cover.emoji)} ${sign.toUpperCase()}: ${fortune}`
            })
            .then(async function(res) {
              uploadCoverImage(res.body.id, key, cover.image)
              await spotify.addTracksToPlaylist(res.body.id, playlist) // add tracks to playlist
              .catch((err) => { console.error(err) })
              },
              function(err) { console.error(err) });
        })
      }