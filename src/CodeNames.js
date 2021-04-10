import React from 'react'
import styled from 'styled-components';

const array = [['Переподвыподверт','цвет'],['Переподвыподверт','цвет'],['Переподвыподверт','цвет'],['Переподвыподверт','цвет'],['Переподвыподверт','цвет'],['Переподвыподверт','цвет'],
              ['Переподвыподверт','цвет'],['Переподвыподверт','цвет'],['Переподвыподверт','цвет'],['Переподвыподверт','цвет'],['Переподвыподверт','цвет'],['Переподвыподверт','цвет'],
              ['Переподвыподверт','цвет'],['Переподвыподверт','цвет'],['Переподвыподверт','цвет'],['Переподвыподверт','цвет'],['Переподвыподверт','цвет'],['Переподвыподверт','цвет'],
              ['Переподвыподверт','цвет'],['Переподвыподверт','цвет'],['Переподвыподверт','цвет'],['Переподвыподверт','цвет'],['Переподвыподверт','цвет'],['Переподвыподверт','цвет'],
              ['Переподвыподверт','цвет'],['Переподвыподверт','цвет'],['Переподвыподверт','цвет'],['Переподвыподверт','цвет'],['Переподвыподверт','цвет'],['Переподвыподверт','цвет'],
              ['Переподвыподверт','цвет'],['Переподвыподверт','цвет'],['Переподвыподверт','цвет'],['Переподвыподверт','цвет'],['Переподвыподверт','цвет'],['Переподвыподверт','цвет'],]

export default function CodeNames() {
  return (
    <Full>
      <RedTeam>
        <Player isMaster={true} />
        <Line />
        <Players />
      </RedTeam>
      <Game arr={array} />
      <BlueTeam>
        <Player isMaster={true} />
        <Line />
        <Players />
      </BlueTeam>
    </Full>
  )
}

const Player = ({name, isMaster}) => {
  return(
    <Name name={name} >
      {name || isMaster ? 'Became a master' : 'Join team'}
    </Name>
  )
}

const Players = ({players}) => {
  return(<>
      {
        players && players.map((player, index) => console.log(player))
      }
    <Player /> 
  </>)
}

const Game = ({arr}) => {
  const len = Math.sqrt(arr.length)
  return(<GameDivWrap>
    <GameDiv id='GameDiv'>
      {
        arr.map((word, index) => <GameButton key={index} gapcnt={len}><div>{word[0]}</div></GameButton>)
      }
    </GameDiv>
  </GameDivWrap>)
}

const Full = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  user-select: none;
  background: linear-gradient(90deg, #80201d, #114b80);
`

const RedTeam = styled.div`
  width: 100px;
  height: 500px;
  background: #b71c1c;
  padding: 10px;
`

const BlueTeam = styled.div`
  width: 100px;
  height: 500px;
  background: #01579B;
  padding: 10px;
`

const Name = styled.div`
  ${props => props.name
    ?`
      color: white;
      `
    :`
      color: black;
    `}
`

const Line = styled.hr`
  border: 0;
  height: 1px;
  background-image: linear-gradient(to right, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.75), rgba(0, 0, 0, 0));
`

const GameDivWrap = styled.div`
  width: 100%;
  height: 500px;
  margin: 10px;
  display: flex;
  justify-content: center;

`

const GameDiv = styled.div`
  max-width: 910px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`

const GameButton = styled.div`
  width: calc(${props => 100/props.gapcnt}% - ${props => 10*(props.gapcnt-1)/props.gapcnt}px);
  height: 10%;
  border-radius: 5px;
  background: white;
  cursor: pointer;
  & div {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    word-break: break-all;
  }
`
