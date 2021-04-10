import React, { useState } from 'react'
import styled from 'styled-components'
import sett from './settings.svg'

export default function Settings({room, handleChangesettings, getNewWords, pauseGame, startGame}) {
  const [inSettings, setInSettings] = useState(false)
  return (
    <SettingsFull onMouseEnter={()=>setInSettings(true)} onMouseLeave={()=>setInSettings(false)} inSettings={inSettings} >
    {inSettings
      ? 
        <>
        <SettingsRow>
          <Setting onWheel={(e) => e.nativeEvent.wheelDelta > 0 ? handleChangesettings('timeToThink', Number(room.timeToThink+1)) : handleChangesettings('timeToThink', Number(room.timeToThink-1))}>
            <SettingName>Время лидера</SettingName>
            <SettingValue>{room.timeToThink}</SettingValue>
          </Setting>
          <Setting onWheel={(e) => e.nativeEvent.wheelDelta > 0 ? handleChangesettings('timeToAnswer', Number(room.timeToAnswer+1)) : handleChangesettings('timeToAnswer', Number(room.timeToAnswer-1))}>
            <SettingName>Время игрока</SettingName>
            <SettingValue>{room.timeToAnswer}</SettingValue>
          </Setting>
          <Setting onWheel={(e) => e.nativeEvent.wheelDelta > 0 ? handleChangesettings('timeByCorrectAnswer', Number(room.timeByCorrectAnswer+1)) : handleChangesettings('timeByCorrectAnswer', Number(room.timeByCorrectAnswer-1))}>
            <SettingName>Доп. время</SettingName>
            <SettingValue>{room.timeByCorrectAnswer}</SettingValue>
          </Setting>
        </SettingsRow>
        <SettingsRow>
          <Setting onClick={()=>handleChangesettings('size', room.size === 5 ? 6 : 5)}>
              <SettingName>Размер поля</SettingName>
              <SettingValue>{room.size}</SettingValue>
            </Setting>
            <Setting onClick={()=>handleChangesettings('teams', room.teams === 2 ? 3 : 2)}>
              <SettingName>Коман ды</SettingName>
              <SettingValue>{room.teams}</SettingValue>
            </Setting>
            <Setting isgreen={room.traitorMode ? 1 : 0} onClick={()=>handleChangesettings('traitorMode', !room.traitorMode)}>
              <SettingName>Преда тель</SettingName>
            </Setting>
          </SettingsRow>
        <SettingsRow>
          <Setting isgreen={room.customWords ? 1 : 0} onClick={()=>handleChangesettings('customWords', !room.customWords)}>
            <SettingName>Свои слова</SettingName>
          </Setting>
          <Setting onClick={getNewWords}>
            <SettingName>Новые слова</SettingName>
          </Setting>
          <Setting isgreen={room.gameStarted ? 1 : 0} onClick={room.gameStarted ? pauseGame : startGame}>
            <SettingName>{room.gameStarted ? 'Остано вить' : 'Начать'}</SettingName>
          </Setting>
        </SettingsRow>
        </>
      : 
        <img src={sett} style={{width: '100%'}} alt='' />
      }
    </SettingsFull>
  )
}

const SettingsFull = styled.div`
  position: absolute;
  bottom: 0;
  right: 0;
  overflow: hidden;
  height: ${props => props.inSettings ? '300' : '50'}px;
  width: ${props => props.inSettings ? '325' : '50'}px;
  transition: .3s linear;
  z-index: 3;
`

const SettingsRow = styled.div`
  width: 100%;
  height: 100px;
  background: #131418;
  display: flex;
  & input {
    width: 20px;
  }
  `
  
  const Setting = styled.div`
  transition: .1s linear;
  background-color: ${props=> props.isgreen === 1 ? '#2E7D32' : props.isgreen === 0 ? '#c62828' : '#131418'};
  margin: 2px;
  border-radius: 3px;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  position: relative;
  & input {
    width: 20px;
  }
  : hover {
    background: #44464a;
  }
`

const SettingName = styled.div`
  z-index: 2;
  text-align: center;
  color: black;
  font-size: 20px;
  font-weight: bold;
  line-height: 17px;
  width: calc(100% - 20px);
`

const SettingValue = styled.div`
  z-index: 1;
  color: white;
  font-size: 90px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`
