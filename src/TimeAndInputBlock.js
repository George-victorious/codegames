import React, { useState } from 'react'
import styled from 'styled-components'

export default function TimeAndInputBlock({socket, globaleTime, idMaster, myId}) {
  const [message, setMessage] = useState('')

  const handleSendMessage = () => {
    if(message !== '') {
    socket.emit('send', message)
    setMessage('')
    }
  }

  return (
    <>
      <InputBlock>
      { globaleTime.MasterTurn && idMaster === myId &&
        <>
          <InputInput value={message} onChange={e=>setMessage(e.target.value)} />
          <InputButton onClick={handleSendMessage}>Добавить</InputButton>
        </>
      }
        </InputBlock>
      <Timer>{
          globaleTime.MasterTurn
          ? globaleTime.timeToThinkLeft ? globaleTime.timeToThinkLeft : globaleTime.timeToAnswerLeft
          : globaleTime.timeToAnswerLeft
      }</Timer>
    </>
  )
}

const Timer = styled.div`
  height: 50px;
  width: 100%;
  color: ${props=>props.colow || 'white'};
`

const InputBlock = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 50px;
  width: 100%;
`

const InputInput = styled.input`
  outline: none;
  color: white;
  margin-bottom: 5px;
  border: 1px solid #1976D2;
  border-radius: 3px;
  background-color: #424242;
  padding: 3px;
  width: calc(100% - 8px);
`

const InputButton = styled.button`
  outline: none;
  color: #d32f2f;
  border-radius: 3px;
  border: 1px solid #d32f2f;
  background-color: #424242;
  width: 100%;
`

