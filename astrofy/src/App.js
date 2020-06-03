import React, {useEffect, useState} from 'react';
import './App.css';
import GetFate from './Go';
    

function App() {
    //State lives here
    let [params,setParams] = useState(null);
    let [login, setLogin] = useState(false);
    let [state, setState] = useState({
      name: '',
      month: '',
      day: '',
      clicked: false
    })

    const handleChange = (e) => {
      let value = e.target.value
      let name = e.target.name
      setState({...state, [name]: value})
    }

    const handleClick = (e) => {
      e.preventDefault();
      setState({...state, clicked: true})
      
    };

    
    console.log(state);
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
        <a href="http://localhost:8888/login"><div className="button">CONNECT TO SPOTIFY</div></a>
      </div>
        {login?
          <>
          <form >
          <label id="form1">
            <input 
              className='form-input' 
              type="text" 
              placeholder="FIRST NAME"
              name="name"
              value={state.name}
              onChange={handleChange}/>
          </label>
          <label id="form2">
            <input 
                className='form-input' 
                type="number" 
                placeholder="MONTH" 
                name="month" 
                value={state.month} 
                onChange={handleChange}/>
            <input 
                className='form-input' 
                type="number" 
                placeholder="DAY"
                name="day"
                value={state.day}
                onChange={handleChange}/>
          </label>
          <button className="button" style={{background: 'red'}}onClick={handleClick}>MAKE PLAYLIST</button>
          </form>
          {state.clicked? <GetFate month={state.month} day={state.day} name={state.name} token={params.access_token} userSpotifyId='vunderkind'/>: null}
          </>
        : null}
    </div>
  );
}

export default App;
