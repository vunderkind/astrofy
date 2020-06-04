import React from 'react';
import icon from '../img/astro.png'
import '../App.css'

export default function Results(props){
    return (
        <div>
            <div className="image">
            <img src={icon} alt='your horoscope'/>
            </div>
            <h3 id="green">{props.name}, this playlist has songs from</h3>
            <p>and 30 more artistes...</p>
            <h3 id="green">your horoscope</h3>
            <p>
                {props.horoscope.toUpperCase()} - {props.fortune}
            </p>
            <h3 id="green">take a screenshot, and tag <span id="white">@astrofy</span> on IG and Twitter</h3>
            <p>...and let us know if you enjoyed the playlist</p>
            <div className="button">OPEN IN SPOTIFY</div>
        </div>
    )
}