import React from 'react';
import './App.css';

function App() {
  return (
    <div className="background">
      <div className="headers">
      <h1>ASTROFY MUSIC</h1>
      <h2>Make a playlist aligned <br/>to your <span id="green">horoscope</span></h2>
      <h3>Simply enter your name and birthday <br/> and you're on your way!</h3>
      <form >
        <label>
          <input className='form-input' type="text" placeholder="FIRST NAME"/>
        </label>
        <label>
          <input className='form-input' type="text" placeholder="MONTH"/>
          <input className='form-input' type="text" placeholder="DAY"/>
        </label>
      </form>
      </div>
    </div>
  );
}

export default App;
