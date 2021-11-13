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

function Audio({state,data}){
  /* 
    Data = {
      bars > beats > tatums,
      sections > segments,
      track: {
        duration,
        key, mode,
        tempo,
        time_signature,
      }
    }
  
    Sections [] : {  start, duration, key, temp, time_signature }

  */

  const lines = []
  
  // console.log(' Data ', data )
  // console.log(' lines ', lines )
  
  const signature = data.track.time_signature
  const tempo = data.track.tempo
  const t_beat = 60/tempo
  const t_bar = signature * t_beat

  React.useEffect(()=>{
    const grid = document.getElementById('grid')
    
    console.log(grid.childNodes)
    let last;

    let int = setInterval(()=>{
      let t = ( new Date() - state.begin + state.progress ) / 1000
      let b = findBar(data.bars,t)
      let bar = grid.childNodes[b]

      if(last)  last.style.border = '1px solid black'
      if(bar){
        bar.scrollIntoView() 
        bar.style.border = '2px solid red'
        last = bar
      }
    },200)

    return ()=> clearInterval(int)
  },[state])

  return (
    <div>
      <div>META</div>
      <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)'}}>
        {/* <div>Track</div><div>{data.track.duration}</div> */}
        <div>duartion</div><div>{data.track.duration}</div>
        <div>signature</div><div>{signature}</div>
        <div>tempo</div><div>{tempo}</div>
        <div>1 beat ~</div><div>{t_beat}</div>
        <div>1 bar ~</div><div>{t_bar}</div>
      </div>
      <div>SECITONS</div>
      
      <div id='grid' style={{
        display: 'grid', 
        gridTemplateColumns: 'repeat(4,1fr)',
        gridAutoRows: '100px',
        padding: '0px 20px',
      }}>
        {/* BARS */}
        {data.bars.map((bar,i)=>{
          let start = bar.start
          let end = bar.start + bar.duration

          let secs = findSecSeg(data.sections ,start,end)

          return (
            <div key={i} style={{     // BAR
              border: '1px solid black',
              marginBottom: '20px',
            }} >
              <div style={{fontSize:'0.8rem', }} >{i} {start} </div>

              <div style={{ 
                display:'flex', flexDirection:'row', justifyContent:'space-evenly',
              }}>
                {secs.map((s,j)=> <div key={j} > {keyLetters[s.key]}{s.mode===0?'m':''} </div> )}
              </div>

            </div>
          )
        })}

      
      </div>

    </div>
  )
}

function findBar(bars,t){
  for(let x=0;x<bars.length;x++){
    let bar = bars[x]
    if(t>=bar.start && t<=bar.start+bar.duration)
      return x;
  }
}

const keyLetters = [ 'C','C#','D','D#','E','F','F#','G','G#','A','A#','B']

function findSecSeg(list,start,end){
  let sects = []

  for(let x=0;x< list.length; x++){
    let sec = list[x]
    sec.end = sec.start + sec.duration

    if(sec.start<end && sec.end>start )   sects.push(sec)
    else if(sec.start>end)        break;    
  }
  return sects;
}


function Player({state,api}){

  const [data,setData] = React.useState()
  
  React.useEffect(()=>{
    if(state.id){
      api.getTrack(state.id)
        .then(data=> setData(data) )
    }
  },[state])

  
  if(!data)
  return (
      <div>
        <div>PLAYer</div>
        <div>Loading data </div>
      </div>
    )
    
  console.log(' <player state ', state,'\n Data : ', data )
  
  return (
    <div>
      <div>Player</div>
      <div>Track : {state.name}</div>
      <div>
      <Audio state={state} data={data} />
      </div>
    </div>
  )
}

function App() {

  
  const [token, api ] = useSpotifApi()

  const [state,setState] = React.useState({
    playing: false,
  })


  // * Update song id 
  React.useEffect(()=>{
    if(!token)  return;    

    const playbackUpdate = ()=>{
      let bef = new Date()
      api.getPlayback()
      .then(data=>{ 
        let aft = new Date()
        if(!data || !data.is_playing){
          if(state.playing)   setState({ playing: false })
        }    
        else 
          if(state.id !== data.item.id ){
            let t = (bef.getTime()+aft.getTime())/2
            setState({
              name: data.item.name+' - '+data.item.artists.map(art=>art.name).join(', '),
              playing: true,
              id: data.item.id,
              progress: data.progress_ms,
              begin: new Date(t),
            })
          }
      })
    }

    playbackUpdate()

    let int = setInterval( playbackUpdate ,10*1000)    
    return ()=>clearInterval(int)

  },[token,state])
  
  

  if(!token)     
    return <Login />
  
  if(!state.playing) 
    return <div>NO PLAYBACK DATA</div>
  

  return (
    <div className="App">
      
      <header className="App-header">
        <h2>user get current playback state</h2>
      </header>

      <main>
        <Player state={state} api={api} />
        
      </main>

    </div>
  );
}

export default App;
