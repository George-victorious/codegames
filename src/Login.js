import React, { useState } from 'react'
import axios from 'axios'
import styled from 'styled-components'

export default function Login() {
  const [isReg, setIsReg] = useState(false)
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [passwordRep, setPasswordRep] = useState('')

  return ( isReg
    ? <RegistrationBlock login={login} setLogin={setLogin} password={password} setPassword={setPassword} passwordRep={passwordRep} setPasswordRep={setPasswordRep} isReg={isReg} setIsReg={setIsReg} />
    : <LoginBlock login={login} setLogin={setLogin} password={password} setPassword={setPassword} isReg={isReg} setIsReg={setIsReg} />
  )
}

const LoginBlock = ({login, setLogin, password, setPassword, isReg, setIsReg}) => {

  const logReq = () => {
    axios.get('https://localhost:5000/login')
      .then(res => localStorage.setItem('key', res.body.token))
      .catch(err => console.log(err))
  }

  return (
    <Block>
      <Input value={login} onChange={e=>setLogin(e.target.value)} placeholder="Логин"/>
      <Input value={password} onChange={e=>setPassword(e.target.value)} placeholder="Пароль"/>
      <Button onClick={logReq}>Войти</Button>
      <CustomLink onClick={()=>setIsReg(!isReg)}>У меня нет аккаунта</CustomLink>
    </Block>
  )
}

const RegistrationBlock = ({login, setLogin, password, setPassword, passwordRep, setPasswordRep, isReg, setIsReg}) => {

  const regReq = () => {
    console.log('Зарегистрироваться')
  }

  return (
    <Block>
      <Input value={login} onChange={e=>setLogin(e.target.value)} placeholder="Логин"/>
      <Input value={password} onChange={e=>setPassword(e.target.value)} placeholder="Пароль"/>
      <Input value={passwordRep} onChange={e=>setPasswordRep(e.target.value)} placeholder="Повторите пароль"/>
      <Button onClick={regReq}>Зарегистрироваться</Button>
      <CustomLink onClick={()=>setIsReg(!isReg)}>У меня есть аккаунта</CustomLink>
    </Block>
  )
}

const Block = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`

const Input = styled.input`
  outline: none;
`

const Button = styled.button`
  outline: none;
`

const CustomLink = styled.div`
  color: blue;
  text-decoration: underline;
  cursor: pointer;
`
