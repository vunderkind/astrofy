import React, {useEffect, useState} from 'react';
import '../App.css';
import GetFate from './Go';
import Form from './Form';
    

function App() {
    let [params,setParams] = useState(null);
    let [login, setLogin] = useState(false);
    let [visibility, setVisibility] = useState({
      display: 'visible'
    })
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
      setVisibility({display: 'none'})
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
        {login?
        <>
          <div style={{display: visibility.display}}>
          <h1>YOUR HOROSCOPE PLAYLIST</h1>
          <h3>Enter your name and birthday <br/> and get your <span id="green">playlist!</span></h3>
          <Form
              handleChange={handleChange} 
              handleClick={handleClick} 
              state={state}/>
          </div>
          {state.clicked? <GetFate month={state.month} day={state.day} name={state.name} token={params.access_token}/>: null}
          </>
        : <><h1>ASTROFY MUSIC</h1>
        <h2>Make a playlist aligned <br/>to your <span id="green">horoscope</span></h2>
        <h3>Simply enter your name and birthday <br/> and you're on your way!</h3>
          <a href="http://localhost:8888/login"><div className="button">CONNECT TO SPOTIFY</div></a></>}
        </div>
    </div>
  );
}

export default App;
