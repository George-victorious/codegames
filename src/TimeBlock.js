import React from 'react'
import styled from 'styled-components'

export default function TimeBlock({gT, isStarted}) {
  
  return (
      <Timer>
        { 
          isStarted &&
            gT.MasterTurn
            ? gT.timeToThinkLeft
              ? gT.timeToThinkLeft
              : gT.timeToAnswerLeft
            : gT.timeToAnswerLeft
        }
      </Timer>
  )
}

const Timer = styled.div`
  color: white;
  height: 50px;
  width: 100%;
`
