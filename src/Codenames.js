import React, { useEffect, useState } from 'react'
import styled from 'styled-components';
import TimeBlock from './TimeBlock'
import Master from './Master'
import Players from './Players'
import Game from './Game'
import SettingsBlock from './Settings'
import back from './back.svg'
import io from 'socket.io-client';
import { Link } from 'react-router-dom';
import FullInput from './FullInput';

let socket;
const Home = () => {
  const username = useState(localStorage.getItem('username'))
  const [room, setRoom] = useState({})
  const [words, setWords] = useState([])
  const [myId, setMyId] = useState(null)
  const [globaleTime, setGlobaleTime] = useState({})
  const [wordChosen, setWordChosen] = useState(null)

  const handleChangesettings = (prop,value) => {
    socket.emit('settings', prop, value)
  }

  const becomeMaster = color => {
    socket.emit('becomeMaster', color)
  }

  const becomePlayer = color => {
    socket.emit('becomePlayer', color)
  }

  const getNewWords = () => {
    socket.emit('newWords', null)
  }

  const startGame = () => {
    socket.emit('startGame', null)
  }

  const pauseGame = () => {
    socket.emit('pauseGame', null)
  }

  const handleClickButton = index => {
    socket.emit('clickButton', index)
  }

  useEffect(() => {
    socket = io('https://codenamesserver.herokuapp.com/', {
      transports: ['websocket']
    })
    socket.on('connect', () => {
      console.log('connect')
      socket.emit('username',username[0])
    })

    socket.on('getId', id => {
      console.log('getId')
      setMyId(id)
    })
    
    socket.on('globaleTime', globaleTime => {
      console.log('globaleTime')
      setGlobaleTime(globaleTime)
    })

    socket.on('wordChosen', wordChosen => {
      console.log('wordChosen')
      setWordChosen(wordChosen)
    })

    socket.on('room', room => {
      console.log('room')
      setRoom(room)
    })

    socket.on('words', words => {
      console.log('setwords')
      setWords(words)
    })

    socket.on('buttonClicked', (buttonIndex, id) => {
      const anim = document.getElementById('GameButton'+buttonIndex).animate([
        {transform: 'scale(1)'},
        {transform: 'scale(1.05)'},
        {transform: 'scale(1)'}
      ], {
        duration: 300,
        easing: 'linear'
      })
      anim.play();

      const anim1 = document.getElementById('RoundColor'+id).animate([
        {transform: 'scale(1)'},
        {transform: 'scale(2)'},
        {transform: 'scale(1)'}
      ], {
        duration: 300,
      })
      anim1.play();
    })

    return () => socket.disconnect();
  // eslint-disable-next-line
  }, [])

  return (
    <Full>
      <WhiteTeam >
        <Players
          becomePlayer={becomePlayer}
          color='white'
          roomColor={room.white}
          />
      </WhiteTeam>
      <RedTeam>
        <Team>
          <Master
            becomeMaster={becomeMaster}
            color='red'
            player={room.redMaster}
            />
          <Line />
          <Players
            becomePlayer={becomePlayer}
            color='red'
            roomColor={room.red}
            gameStarted={room.gameStarted}
            />
          <PlayerWords>
            {room.gameStarted &&
              room.redWords.map((word,i)=><div key={word+i}>{word}</div>)
            }
          </PlayerWords>
          {
            room.gameStarted && room.teamTurn === 'red' &&
              <>
                <FullInput
                  socket={socket}
                  masterTurn={globaleTime.MasterTurn}
                  isMaster={room.redMaster[0].id === myId}
                />
                <TimeBlock gT={globaleTime} isStarted={room.gameStarted} />
              </>
          }
        </Team>
          <BidValue colorw={'#80201d'}>
            {room.redWordsLeft}
          </BidValue>
      </RedTeam>
      <Game
        handleClickButton={handleClickButton}
        wordChosen={wordChosen}
        size={room.size}
        teamWordsClicked={room.teamWordsClicked}
        words={words}
        />
      <BlueTeam>
        <Team>
          <Master
            becomeMaster={becomeMaster}
            color='blue'
            player={room.blueMaster}
            />
          <Line />
          <Players
            becomePlayer={becomePlayer}
            color='blue'
            roomColor={room.blue}
            gameStarted={room.gameStarted}
            />
          <PlayerWords>
            {
              room.blueWords && room.blueWords.map((word,i)=><div key={word+i}>{word}</div>)
            }
          </PlayerWords>
          {
            room.gameStarted && room.teamTurn === 'blue' &&
            <>
              <FullInput
                socket={socket}
                masterTurn={globaleTime.MasterTurn}
                isMaster={room.blueMaster[0].id === myId}
              />
              <TimeBlock gT={globaleTime} isStarted={room.gameStarted} />
            </>
          }
          </Team>
        <BidValue colorw={'#114b80'}>
          {room.blueWordsLeft}
        </BidValue>
      </BlueTeam>
      <SettingsBlock
        room={room}
        handleChangesettings={handleChangesettings}
        getNewWords={getNewWords}
        pauseGame={pauseGame}
        startGame={startGame}
        />
        <Link to={'/'}><Img src={back} alt='' title='??????????' /></Link>
    </Full>
  );
};

export default Home;

const Full = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  user-select: none;
  background: linear-gradient(90deg, #80201d, #114b80);
  position: relative;
`

const WhiteTeam = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: calc(100% - 10px);
  padding: 5px;
  background: rgba(255, 255, 255, 0.2);
  overflow: hidden;
  display: flex;
  flex-direction: row;
`

const BidValue = styled.div`
  position: absolute;
  color: ${props=>props.colorw};
  position: absolute;
  font-size: 100px;
  bottom: 40%;
  text-align: center;
  width: calc(100% - 20px);
`
  
const RedTeam = styled.div`
  width: 140px;
  height: 500px;
  background: #b71c1c;
  position: relative;
  padding: 10px;
  z-index: 1;
`

const Team = styled.div`
  position: absolute;
  width: calc(100% - 20px);
  height: 500px;
  z-index: 1;
`

const BlueTeam = styled.div`
  width: 140px;
  height: 500px;
  background: #01579B;
  position: relative;
  padding: 10px;
  z-index: 1;
`

const PlayerWords = styled.div`
  margin: 10px;
  width: calc(100% - 20px);
  height: 185px;
  overflow-x: hidden;
  overflow-y: auto;
  ::-webkit-scrollbar {
    display: none;
  }
  color: white;
  flex-direction: column;
  justify-content: flex-end;
  word-wrap: break-word;
`

const Line = styled.hr`
  border: 0;
  height: 1px;
  background-image: linear-gradient(to right, rgba(0, 0, 0, 0), rgba(255, 255, 255, 0.75), rgba(0, 0, 0, 0));
`

const Img = styled.img`
  color: black;
  width: 50px;
  position: absolute;
  bottom: 0;
  left: -25px;
  cursor: pointer;
  transition: 1s;
  : hover {
    width: 100px;
    left: 0;
  }
`
