import React from 'react'
import styled from 'styled-components'

export default function Master({becomeMaster, color, player}) {
  return player
    && player.length
      ? <PlayerRow><RoundColor color={player[0].isAdmin
        ? '000000'
        : player[0].personalColors} />
            <Player>
              { player[0].name }
            </Player>
        </PlayerRow>
      : <PlayerLink onClick={()=>becomeMaster(color)}>
          Стать лидером
        </PlayerLink>
}


const RoundColor = styled.div`
  background: #${props=>props.color};
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

const PlayerRow = styled.div`
  display: flex;
  align-items: center;
  flex-direction: row;
  margin: 0 5px;
`

