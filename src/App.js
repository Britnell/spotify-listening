import React from 'react';

import useSpotifApi from './spotify';
import { spotifyLoginURL } from './spotify';

import './App.css';


function Login(){

  return (
    <div>
      <div>LOGIN to spotify to link with your current listening</div>
      <a href={spotifyLoginURL()}>Login</a>
    </div>
  )
}


function App() {


  const [token, api ] = useSpotifApi()

  const [data,setData] = React.useState()

  
  React.useEffect(()=>{
    if(!token)  return;    
    
    api.getPlayback()
    .then(data=> setData(data) )

  },[token])
  

  
  if(!token)     
    return <Login />
  
  if(!data) 
    return <div>NO PLAYBACK DATA</div>
  

  return (
    <div className="App">
      
      <header className="App-header">
        <h2>user get current playback state</h2>
      </header>

      <main>
        <div>
          {Object.keys(data).map((key,i)=>
            <div key={i}>
                <h3>{key}</h3>
                <div>{JSON.stringify(data[key])}</div>
            </div>
          ) }
        </div>
      </main>

    </div>
  );
}

export default App;
