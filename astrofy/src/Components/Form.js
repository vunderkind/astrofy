import React from 'react';
export default function Form (props) {
    return (
        <form style={{display:props.visibility}}>
          <label id="form1">
            <input 
              className='form-input' 
              type="text" 
              placeholder="FIRST NAME"
              name="name"
              value={props.state.name}
              onChange={props.handleChange}/>
          </label>
          <label id="form2">
            <input 
                className='form-input' 
                type="number" 
                placeholder="MONTH" 
                name="month" 
                value={props.state.month} 
                onChange={props.handleChange}/>
            <input 
                className='form-input' 
                type="number" 
                placeholder="DAY"
                name="day"
                value={props.state.day}
                onChange={props.handleChange}/>
          </label>
          <button className="button" style={{background: 'red'}}onClick={props.handleClick}>MAKE PLAYLIST</button>
          </form>
    )
}