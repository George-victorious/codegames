import React, { useEffect, useState } from 'react'
import { Redirect } from 'react-router';
import io from 'socket.io-client';
import styled from 'styled-components';
//import { Link } from "react-router-dom";
import bg from './dark_back.png'

const socket = io('http://192.168.0.100:5000', {
  transports: ['websocket', 'polling']
});
const games = [
  {
    name: 'Коднеймс',
    link: 'codenames'
  },
  {
    name: 'Алиас',
    link: 'alias'
  }
]

const Home = () => {// eslint-disable-next-line
  const [username, setUsername] = useState(localStorage.getItem('username') || 'Неопознынный Бегемот')
  const [users, setUsers] = useState(null)
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([])
  const [rooms, setRooms] = useState([])
  const [game, setGame] = useState(null)
  const [room, setRoom] = useState(null)

const actualDate = (d) => {
  const date = new Date(d)
  const hours = date.getHours()
  const minutes = date.getMinutes()
  return hours + ':' + (minutes > 9 ? minutes : `0${minutes}`)
}

const sendMessage = () => {
  if(message !== '') {
  socket.emit('send', message)
  setMessage('')
  }
}

const createRoom = () => {
  socket.emit('createRoom', 'RoomName')
}

useEffect(() => {
  socket.on('connect', () => {
    socket.emit('username',username)
  })

  socket.on('message', message => {
    setMessages(messages => [...messages, message])
  })

  socket.on('room', room => {
    setRoom(room)
  })

  socket.on('getUser', user => {
    localStorage.setItem('id', user.uniqueId)
    localStorage.setItem('name', user.name)
  })

  socket.on('disconnected', id => {
    setUsers(users => {
      return users.filter(user => user.id !== id)
    })
  })// eslint-disable-next-line
}, [])

  const SelectRoom = () => {
    return (
      <>
        <button onClick={createRoom} >Создать комнату</button>
        {rooms.map((room,i) =>console.log(room))}
      </>
    )
  }

  const SelectGame = () => {
    return games.map((game,i) =><button key={i} onClick={()=>setGame(game.link)}>{game.name}</button>)
  }

  return (
    <Full>
      {game && room && <Redirect to={`/${game}/${room}`} />}
      <Container>

         <SelectRoom />
         <SelectGame />
      
      </Container>
      <Container>
        {users && users.map((user,i) =><div key={i}>{user.name}</div>)}
      </Container>
      <Container>
        <Chat>
          {messages && messages.map((m,i) => 
            <ChatRow key={i}>
              <div>{actualDate(m.time)}</div>
              <div>{m.user}</div>
              <div>{m.message}</div>
            </ChatRow>
            )}
        </Chat>
        <Send>
          <input
            placeholder="Сообщение..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          />
          <button onClick={sendMessage} >Отправить</button>
        </Send>
      </Container>
    </Full>
  );
};

export default Home;

const Full = styled.div`
  width: 100vw;
  height: 100%;
  background-image: url(${bg});
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 25px;
`

const Container = styled.div`
  width: 100%;
  height: calc(100% - 50px);
  background: white;
  border-radius: 25px;
  overflow: hidden;
`

const Chat = styled.div`
  width: 100%;
  height: calc(100% - 50px);
`

const ChatRow = styled.div`
  display: flex;
  justify-content: space-between;
`

const Send = styled.div`
  width: 100%;
  height: 50px;
  & input {
    outline: none;
    width: 275px;
  }
`
