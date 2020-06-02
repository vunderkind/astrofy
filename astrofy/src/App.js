import React, {useEffect, useState} from 'react';
import './App.css';
import Go from './Go';
    

function App() {
    //State lives here
    let [params,setParams] = useState(null);
    let [login, setLogin] = useState(false);

    useEffect(() => {
      var hashParams = {};
      var e, r = /([^&;=]+)=?([^&;]*)/g,
          q = window.location.hash.substring(1);
      e = r.exec(q)
      while (e) {
         hashParams[e[1]] = decodeURIComponent(e[2]);
         e = r.exec(q);
      }
      setParams(params=hashParams);
      console.log('Params: ', params.access_token);
      const token = params.access_token;
      setLogin(token? login=true : login=false);
      console.log(login)
    }, [])

    
  return (
    <div className="background">
      <div className="headers">
      <h1>ASTROFY MUSIC</h1>
      <h2>Make a playlist aligned <br/>to your <span id="green">horoscope</span></h2>
      <h3>Simply enter your name and birthday <br/> and you're on your way!</h3>
      <form >
        <label id="form1">
          <input className='form-input' type="text" placeholder="FIRST NAME"/>
        </label>
        <label id="form2">
          <input className='form-input' type="text" placeholder="MONTH"/>
          <input className='form-input' type="text" placeholder="DAY"/>
        </label>
        <a href="http://localhost:8888/login">Log in to Spotify</a>
        {/* <button>CONNECT TO SPOTIFY</button> */}
        {login? <div>
          <h1>We're in!</h1>
          <h2>For real</h2>
          <Go month='8' day='10' name='Justin' token={params.access_token} userSpotifyId='vunderkind'/>
        </div>: null}
      </form>
      </div>
    </div>
  );
}

export default App;
