import React, {useEffect} from 'react';
import axios from 'axios';
import './App.css';

function App() {
  useEffect(()=>{
    axios.get('localhost:8888/login')
    .then(res=>console.log(res))
    .catch(error=>console.log(error))
  },[])
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
        <button>CONNECT TO SPOTIFY</button>
      </form>
      </div>
    </div>
  );
}

export default App;
