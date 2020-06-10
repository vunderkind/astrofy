import React from 'react';
import icon from '../img/astro.png'
import '../App.css'

export default function Results(props){
    return (
      <div>
          {props.tracks?
          <div className="form-container">
            <div className="title">
              <h3><span className="name">{props.name}</span>, this playlist has songs from</h3>

              <div className="image-group">
                  {props.tracks.slice(0,4).map((track)=>
                    <div
                      className="image"
                      key={track.artist_name}>
                      <img
                        className = 'album'
                        src={track.image}
                        alt={track.artist_name}/>
                    </div>
                  )}

              </div>
            </div>
          </div>
          : null }
          <div className="container">
            <div className="title">
              <h3>Your Horoscope for Today</h3>
              <p>
                {props.horoscope.toUpperCase()} - {props.fortune}
              </p>
            </div>
          </div>
          <div className="container">
            <div className="title">
              <h3>Let us know if you enjoyed the playlist</h3>
              <p>
                Tag @astrofymusic on IG and Twitter
              </p>
            </div>
          </div>
          <div>
            <a href={props.playlist_url}>
              <div className='button'>Open in Spotify</div>
            </a>
          </div>
          </div>
  )
}
