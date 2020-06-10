import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { css } from "@emotion/core";
import ScaleLoader from "react-spinners/ScaleLoader";
import Results from './Results';


const astro = require("aztro-js")
const img = require('./img')
const SpotifyWebApi = require('spotify-web-api-node');
const horoscope = require('horoscope')
const spotify = new SpotifyWebApi();

const override = css`
  display: block;
  margin: 0 auto;
  border-color: red;
`;



    //Go function
    export default function GetFate(props){
      let [state, setState] = useState({
        loading: true
      })

      let fabulous;

      let [musicData, setMusicData] = useState({
        fortune: '',
        horoscope: '',
        name: '',
        length: ''
      })
        let userID;
        let cover;
        let userName;
        useEffect(()=> {
            axios.get('https://api.spotify.com/v1/me', {
                headers: {
                    'Authorization': 'Bearer ' + props.token
                  }
            })
            .then(res=>{
                // console.log(res);
                userID = res.data.id;
                userName = res.data.display_name
            })
            .catch(err=>console.log(err))


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
                  default:
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
          async function go(props) {
                let settings = {};
                spotify.setAccessToken(props.token)
                let key = props.token;
                let sign = horoscope.getSign({month: parseInt(props.month), day: parseInt(props.day)})
                // console.log(`${props.name} is a ${sign}`)
                let fortune;
                cover = chooseImage(sign)
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

                      if (res.body.items.length === 0) {
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
                                uri: item.uri,
                                artist_name: item.album.artists[0].name,
                                image: item.album.images[0].url,
                                length: topTracks.length-5
                              }
                              topTracks.push(e)
                            }
                          })
                      } else {
                        for (let item of res.body.items) {
                          let e = {}
                          e = {
                            id: item.id,
                            uri: item.uri,
                            artist_name: item.album.artists[0].name,
                            image: item.album.images[0].url,
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
                  // console.log('Top tracks: ', topTracks)
              
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
                    userID,
                    `For ${props.name} by Astrofy`, {
                      'public': true,
                      'description': `${sign.toUpperCase()}: ${fortune}`
                    }) //took out the String.fromCodePoint method because it sometimes returns NaN instead of expected Unicode. See documentation: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/fromCodePoint
                    .then(async function(res) {
                      fabulous = res.body.external_urls.spotify
                      console.log(fabulous)
                      uploadCoverImage(res.body.id, key, cover.image)
                      await spotify.addTracksToPlaylist(res.body.id, playlist)
                      .then(res=>{
                        setState({loading: false})
                        setMusicData({
                          horoscope: sign,
                          fortune,
                          name: userName,
                          tracks: topTracks,
                          length:topTracks.length-5,
                          playlist_url: fabulous

                        });
                      console.log(res)}
                        ) // add tracks to playlist
                      .catch((err) => { console.error(err) })
                      },
                      function(err) { console.error(err) });
                })
    
        }
        go(props)
    },[])
        return (
          
          state.loading? <div className="sweet-loading centered">
          <ScaleLoader
            css={override}
            size={150}
            color={"rgb(30,185,84)"}
            loading={state.loading}/>
            </div>
            : 
            <Results name={props.name} horoscope={musicData.horoscope} fortune={musicData.fortune} tracks={musicData.tracks} length={musicData.length} playlist_url={musicData.playlist_url}/>
            
        )
      }