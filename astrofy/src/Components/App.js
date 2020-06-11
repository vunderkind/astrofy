import React, {useEffect, useState} from 'react';
// import '../App.css';
import GetFate from './GetFate';
import Form from './Form';


function App() {
    let serverURL = `https://gentle-garden-14638.herokuapp.com/login`
    let [params,setParams] = useState(null);
    let [login, setLogin] = useState(false);
    let [visibility, setVisibility] = useState({
      display: 'visible'
    })
    let [state, setState] = useState({
      name: '',
      month: '',
      day: '',
      message: '',
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


    // console.log(state);
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
      // console.log('Params: ', params.access_token);
      const token = params.access_token;
      setLogin(token? login=true : login=false);
      // console.log(login)
    }, [])


  return (
    <div className="body">
      <div className="overall">
        <div>
          <div>
            <img src='./logo.png' alt='logo' className='logo'/>
          </div>
          <div>
            <h1>Astrofy<span className="hidden"> </span>Music</h1>
          </div>
        </div>
      {login?
      <>

      <div style={{display: visibility.display}}>
        <div className="form-container">
          <div className="title">
            <h2>One More Step</h2>
            <p>
              Simply enter your name and birthday and you’re on your way!
            </p>
          </div>
        </div>
        <div>
          <Form
              handleChange={handleChange}
              handleClick={handleClick}
              state={state}/>
        </div>
      </div>
      {state.clicked? <GetFate month={state.month} day={state.day} name={state.name} token={params.access_token}/>: null}

        </>
      : <>
      <div className="container">
        <div className="title">
          <h2>Make a Playlist Based on Your Horoscope</h2>
          <p>
            Let your stars lead the way to vibes and music awesomeness!
          </p>
        </div>
      </div>
      <div className="container">
        <a href= {serverURL}>
          <div className='button'>Connect to Spotify</div>
        </a>
      </div></>}

      <footer>
        <div className="footer">
          <p>
            &copy; 2020. a toy by <a href='https://twitter.com/seyitaylor' target='_blank' rel="noopener noreferrer">st</a> and <a href='https://twitter.com/LifeofMogwai' target = '_blank' rel="noopener noreferrer">mogwai</a><br/>Icons by <a href="https://thenounproject.com/zzyzz/" target="_blank" rel="noopener noreferrer">olena</a> and <a href="https://thenounproject.com/denismm/" target="_blank" rel="noopener noreferrer">denis</a>
          </p>
        </div>
      </footer>
    </div>
  </div>
  );
}

export default App;
