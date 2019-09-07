const aztroJs = require("aztro-js")
const horoscope = require('horoscope')
const SpotifyWebApi = require('spotify-web-api-node');
const spotifyApi = new SpotifyWebApi ({
  // clientId: '2538eb4cf1e44053b1c1d5f6c5ba861e',
  // clientSecret: '073f8066aded42d7a0c5974bd972964a'
});
// Haven't set up getting tokens yet so you have to get it manually from https://developer.spotify.com/console/post-playlist-tracks/. Ensure you've got 'playlist-modify-public' and 'playlist-modify-private'
token = 'BQBdy52jCO4F9VmX0wO2c0tyGvha0eb-WTv4DZKHfhj2pjPR1oyV9ZMmb8ndNvHPhkBrCgDEPiuw-nwFvQWKWy2Uux9iMWJRwfZEP6Kzq4KtHr0UuYE3tl0t3ZCFqQs0PBTAxSmUTsUwpWBdVeX7ZYTdv_ecOvu-NV4wC0Lv8s2hQk9xfJSqiHkACVs0ABOW-IIvyZ13umLshzMxu7YtDfKDQerkhWMAUfzc_G2MlLr47rT9lH_pLt4G5SAzzYgKnrTh0xzMIU_E-HnvVg'

spotifyApi.setAccessToken(token);

// spotifyApi.clientCredentialsGrant()
// .then(function(data) {
//   console.log('The access token is ' + data.body['access_token'])
//   spotifyApi.setAccessToken(data.body['access_token'])
// }).catch(function (err) {
//   console.error('error in credentials: ', err)
// })


let date = {}
let savedTracks = []
let relatedArtists = []
let list
let settings = {}
let person = "Seyi" // enter your name here
let seyi = { month:6, day:30 } // enter your birthday here
let rawList = []
let personal = {}
let playLength = 40
let newLength = 35
let oldLength = 5

async function shuffle(array) {
  let m = array.length, t, i

  // While there remain elements to shuffle…
  while (m) {

    // Pick a remaining element…
    i = Math.floor(Math.random() * m--)

    // And swap it with the current element.
    t = array[m]
    array[m] = array[i]
    array[i] = t
  }
  return array
}

function getSign (date) {
  let res = horoscope.getSign({
    month: date.month,
    day: date.day
  })
  settings.sign = res
  return res
}

function makeSingle(n) {
  let len = n.toString().length
  // console.log(len, typeof len)
  if (len > 1) {
    return Math.floor(n / Math.pow(10, len-1))
  } else {
    return n
  }
}

// ---------------- PARSERS ----------------------------
async function parseSaved (source, output) {
  for (let item of source) {
    // console.log(source)
    let obj = {}
    obj.uri = item.track.uri
    obj.title = item.track.name
    obj.artist = item.track.artists[0].name
    obj.id = item.track.artists[0].id
    output.push(obj)
  }
}

async function parseRelated (source, output) {
  for (let item of source.body.artists) {
    // let obj = {}
    // obj.artist = item.name
    // obj.popularity = item.popularity
    // obj.id = item.id
    output.push(item.id)
    // console.log(item.id)
  }
}

async function getSaved (params, output) {
  console.log('getting saved tracks')
  await spotifyApi.getMySavedTracks(params).then(async function(res) {
    // console.log(res.body.items)
    await parseSaved (res.body.items, output)
  }).catch(function (err) {
    console.log('error in getSaved: ' + err)
  })
  console.log('getting saved tracks - complete')
}

async function getSimilar (data, output) {
  console.log('getting similar artists')
  for (let item of data) {
    // console.log(item.id)
    await spotifyApi.getArtistRelatedArtists(item.id)
    .then(async function (res) {
      await parseRelated (res, output)
    }).catch(function (err) {
      console.log('error in getSimilar: ' + err)
    })
  }
  // console.log(output)
  // console.log('array length is now: ' + output.length)
  console.log('getting similar artists - complete')
}

async function getTop (artist) {
  await spotifyApi.getArtistTopTracks(artist, 'US')
  .then(async function (res) {
    // let track = Math.floor(Math.random() * res.body.tracks.length)
    rawList.push(res.body.tracks[Math.floor(Math.random() * res.body.tracks.length)].uri)
    // for (let item of res.body.tracks) {
    //   // console.log(item.uri)
    //   rawList.push(item.uri)
    // }
  }).catch(function (err) {
    console.log('error in getTop: ' + err)
  })
}

async function onlyUnique(value, index, self) {
    return self.indexOf(value) === index
}

async function getFamiliar(source, final) {
  while (final.length < playLength) {
    final.push(source[Math.floor(Math.random() * source.length)].uri)
  }
  await shuffle(final)
}

async function makeFinal (array) {
  let newArray = []
  while (newArray.length < playLength) {
    newArray.push(array[Math.floor(Math.random() * array.length)])
    newArray = newArray.filter(onlyUnique)
  }
  return newArray
}

async function makePlaylist (params) {
  let name = person + '\'s ' + params.mood + ' playlist'
  let description = params.desc + '\nYou\'ll be luckiest at ' + params.time
  spotifyApi.createPlaylist(name, { 'public' : true, description })
  .then(function(res){
    console.log(res)
  }).catch(function (err) {
    console.log('error in makePlaylist: ' + err)
  })
}

async function addTrackstoPlaylist (array, params) {
  let name = person + '\'s ' + params.mood + ' playlist'
  let description = params.desc + '\nYou\'ll be luckiest at ' + params.time

  await spotifyApi.addTracksToPlaylist('5ilDLzjCjM0yuE7XNVevji', array) // enter the ID for your chosen playlist here
  .then(async function(res) {
    console.log(res.body)
    console.log('adding tracks to playlist - inner')
    await spotifyApi.changePlaylistDetails('5ilDLzjCjM0yuE7XNVevji', {name: name, description: description})
  })
  .then(function() {
    console.log('added tracks')
  }).catch(function (err) {
    console.log('error in addTracksToPlaylist: ' + err)
  })
}

//spotify:playlist:4hDYMpz71Ofvfp1FGrGmjK
//spotify:playlist:5ilDLzjCjM0yuE7XNVevji
//spotify:playlist:5ilDLzjCjM0yuE7XNVevji

//------------------------- HERE WE GOOOOOO ----------------------

// checkHoroscope(seyi).then(async function () {
//   await getSaved(settings, savedTracks).then(async function() {
//     // console.log(settings)
//     await getSimilar (savedTracks, relatedArtists).then(async function () {
//       for (let item of relatedArtists) {
//         await getTop (item.id)
//       }
//     }).then(async function () {
//       await shuffle(rawList)
//     }).then(async function () {
//       let finalest = await makeFinal(rawList)
//     }).catch(function (err) {
//       console.log('error in main: ' + err)
//     })
//   })
// })

async function go (user) {
  await aztroJs.getAllHoroscope(getSign(user), async function(res) {
    let obj = {}
    obj = {
      desc: res.today.description,
      time: res.today.lucky_time,
      color: res.today.color,
      mood: res.today.mood
    }
    let savedSettings = {
      limit: 10,
      offset: parseInt(res.today.lucky_number)
    }
    console.log(savedSettings)
    await getSaved(savedSettings, savedTracks).then(async function() {
      // console.log(settings)
      await getSimilar (savedTracks, relatedArtists).then(async function () {
        console.log('getting top tracks')
        relatedArtists = relatedArtists.filter(onlyUnique)
        await shuffle(relatedArtists)
        relatedArtists.length = newLength
        for (let item of relatedArtists) {
          await getTop (item)
        }
        console.log('getting top tracks - complete')
      }).then(async function () {
        // await shuffle(rawList)
        console.log('getting familiar tracks')
        await getFamiliar(savedTracks, rawList)
        rawList = rawList.filter(onlyUnique)
        console.log('playlist made with ' + rawList.length + ' tracks!')
        console.log('getting familiar tracks - complete')
      })
      // .then(async function () {
      //   let finalest = await makeFinal(rawList)
      //   // console.log(finalest)
      // })
      .then(async function() {
        // await makePlaylist (obj)
        console.log('adding tracks to playlist - main')
        await addTrackstoPlaylist(rawList, obj)
      })
      .catch(function (err) {
        console.log('error in main: ' + err)
      })
    })
  })
}

go(seyi)
