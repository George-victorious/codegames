import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'

export default function Menu() {
  const [username, setUsername] = useState(localStorage.getItem('username'))
  const [inp, setinp] = useState('')

  const changeName = () => {
    setinp(localStorage.getItem('username'))
    setUsername(null)
    localStorage.removeItem('username')
  }

  const aceptName = () => {
    localStorage.setItem('username', inp)
    setUsername(inp)
  }

  return (
    <Full>
      <Container>
        {username
          ?
            <>
              <Link to='/codenames'><CustomButton>Играть</CustomButton></Link>
              <Link to='/add'><CustomButton>Добавить слово</CustomButton></Link>
              <CustomButton onClick={changeName} >Изменить никнейм</CustomButton>
            </>
          :
            <>
              <CustomLabel>Как вас будут видеть другие пользователи</CustomLabel>
              <CustomInput value={inp} onChange={e=>setinp(e.target.value)} placeholder="Никнейм" />
              <CustomButton onClick={aceptName} >Подтвердить</CustomButton>
            </>
          }
      </Container>
    </Full>
  )
}

const Full = styled.div`
  width: 100%;
  height: 100%;
  background: #131418;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
`

const Container = styled.div`
  width: 270px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 20px;
`

const CustomLabel = styled.h3`
  color: #fff;
  text-align: center;
  width: 100%;
`

const CustomInput = styled.input`
  outline: none;
  width: ${props => props.type ? '2rem' : '250px'};
  margin-right: ${props => props.type ? '10px' : '0px'};
  cursor: ${props => props.type ? 'pointer' : 'text'};
  height: 2rem;
  border: 0px;
  border-radius: 10px;
  padding: 0 10px;
  color: #131418;
  font-size: 13pt;
  font-weight: bold;
`

const CustomButton = styled.button`
  outline: none;
  width: 150px;
  height: 50px;
  box-shadow:0 0 10px #131418;
  border-radius: 10px;
  cursor: pointer;
  color: #131418;
  font-size: 13pt;
  font-weight: bold;
`

