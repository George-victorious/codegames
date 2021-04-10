import React, { useState } from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom';
import axios from 'axios';
import back from './back.svg'
export default function AddWords({socket}) {
  const [word, setword] = useState({ru:'', en:'',custom: false})
  const [incorrectWord, setIncorrectWord] = useState('')

  const check = () => {
    if(word.ru.length > 3 && word.en.length > 3) {
      axios({
        method: 'post',
        url: 'http://localhost:5000/addWord',
        body: {word: word}
    })
      .then((res) => console.log(res) || setword({...word, ru:'', en:''}))
      .catch((err) =>console.log(err))
    } else {
      const timer = setInterval(() => {
        setIncorrectWord('')
        clearInterval(timer)
      },2000)
      word.en.length <= 3
        ? setIncorrectWord('Введенный перевод должен содержать больше трех символов.')
        : word.ru.length > 16 && setIncorrectWord('Введенный перевод должен содержать меньше шестнадцати символов.')
      word.ru.length <= 3
        ? setIncorrectWord('Введенное слово должно содержать больше трех символов.')
        : word.ru.length > 16 && setIncorrectWord('Введенный текст должен содержать меньше шестнадцати символов.')
    }
  }

  return (
    <Full>
      <Errer>{incorrectWord}</Errer>
      <Container>
        <div>
          <CustomLabel>Слово</CustomLabel>
          <CustomInput value={word.ru} onChange={e=>setword({...word,ru:e.target.value})} placeholder="Русское слово" />
        </div>
        <div>
        <CustomLabel>Перевод</CustomLabel>
          <CustomInput value={word.en} onChange={e=>setword({...word,en:e.target.value})} placeholder="Английское слово" />
        </div>
        <Flex>
        <CustomLabel margin={'10px'}>Необычное слово?</CustomLabel>
          <CustomInput type='checkbox' value={word.custom} onChange={e=>setword({...word,custom:e.target.value})} />
        </Flex>
        <CustomButton onClick={check} >Отправить</CustomButton>
      </Container>
      <Link to={'/'}><img src={back} style={{color: 'black', fontSize: '100px', position: 'absolute', left: '0', bottom: '0', cursor: 'pointer' }} alt='' /></Link>
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
  height: 35px;
  box-shadow:0 0 10px #131418;
  border-radius: 10px;
  cursor: pointer;
  color: #131418;
  font-size: 13pt;
  font-weight: bold;
`

const CustomLabel = styled.h3`
  color: #fff;
  margin: ${props => props.margin || '5px'};
  width: 100%;
`

const Flex = styled.div`
  width: 280px;
  display: flex;
`

const Errer = styled.div`
  position: absolute;
  top: 25px;
  width: 305px;
  color: white;
  font-size: 20pt;
  font-weight: bold;
  text-align: center;
`
