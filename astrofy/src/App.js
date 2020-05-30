import React from 'react';
import './App.css';

function App() {
  return (
    <div className="background">
      <div className="headers">
      <h1>ASTROFY MUSIC</h1>
      <h2>Make a playlist aligned to your <span id="green">horoscope</span></h2>
      <h3>Simply enter your name and birthday and you're on your way!</h3>
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
