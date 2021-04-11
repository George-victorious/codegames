import React from 'react'
import styled from 'styled-components'

export default function Players ({becomePlayer, color, roomColor, gameStarted}) {
  return (
    <PlayerList colorw={color} >
      { color === 'white' &&
        <PlayerLink
          onClick={()=>becomePlayer(color)}
        >
          Зрители:
        </PlayerLink>
      }
      {
        roomColor && roomColor.map(player =>
          <PlayerRow key={player}>
            <RoundColor
              id={'RoundColor'+player.id}
              colow={player.isAdmin
                ? '000000'
                : player.personalColors}
            />
            <Player id={player.id}>
              {player.name}
            </Player>
          </PlayerRow>)
      }
      { !gameStarted && color !== 'white' &&
          <PlayerLink onClick={()=>becomePlayer(color)}>
            Присоедениться
          </PlayerLink>
      }
    </PlayerList>
  )
}


const PlayerList = styled.div`
  ${props => props.colorw === 'white'
    ? 'display: flex;'
    : 'height: 185px;'}
  overflow-x: hidden;
  overflow-y: auto;
  ::-webkit-scrollbar {
    display: none;
  }
`

const PlayerRow = styled.div`
  display: flex;
  align-items: center;
  flex-direction: row;
  margin: 0 5px;
`

const RoundColor = styled.div`
  background: #${props=>props.colow};
  width: 10px;
  height: 10px;
  border-radius: 50%;
  overflow: hidden;
  margin: 5px;
`

const Player = styled.div`
  color: white;
  width: max-content;
  max-width: 90px;
  overflow: hidden;
  text-align: center;
  text-overflow: ellipsis;
  font-size: 16px;
  font-family: 'Roboto', sans-serif;
`

const PlayerLink = styled.div`
  width: max-content;
  color: white;
  align-items: center;
  border-bottom: 1px dotted;
  cursor: pointer;
  font-family: 'Roboto', sans-serif;
`

