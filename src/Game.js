import React from 'react'
import styled from 'styled-components'

export default function Game({handleClickButton, wordChosen, size, teamWordsClicked, words}) {

  const getColor = (team, isDark) => {
    switch (team) {
      case 'red': return isDark ? ['#ff6450','#8a1000'] : ['#b34637','#8a1000']
      case 'blue': return isDark ? ['#50bbff','#00548a'] : ['#3781b3','#00548a']
      case 'black': return ['#131418','#aaa']
      default: return isDark ? ['#e3c4af','#737065'] : ['#b39a89','#737065']
    }
  }

  return(
    <GameDivWrap>
      <GameDiv>
        {
          words.map((word, i) =>
            <GameButton
              id={'GameButton'+i}
              key={'GameButton_'+i}
              bg={getColor(word.team, !word.isClicked)}
              gapcnt={size}
              onClick={()=>handleClickButton(i)}
            >
              <Word>
                {word.ru}
              </Word>
              {
                wordChosen === i &&
                  <Progress
                    gameTimer={wordChosen === null ? 0 : 1}
                  />
              }
              <RoundColors>
                {
                  teamWordsClicked.map(w =>
                    w.id === i &&
                      <RoundColor color={w.color}/>
                  )
                }
              </RoundColors>
            </GameButton>
          )
        }
      </GameDiv>
    </GameDivWrap>
  )
}


const GameDivWrap = styled.div`
  width: calc(100% - 320px);
  height: 500px;
  margin: 10px;
  display: flex;
  justify-content: center;
  overflow: hidden;

`

const GameDiv = styled.div`
  max-width: 910px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`

const GameButton = styled.div`
  width: calc(${props => 100/props.gapcnt}% - ${props => 10*(props.gapcnt-1)/props.gapcnt}px);
  height: calc(${props => 100/props.gapcnt}% - ${props => 10*(props.gapcnt-1)/props.gapcnt}px);
  border-radius: 5px;
  background-color: ${props => props.bg[0]};
  color: ${props => props.bg[1]};
  cursor: pointer;
  position: relative;
  z-index: 2;
  overflow: hidden;
`

const Word = styled.div`
  height: 100%;
  margin: 0 15px;
  display: flex;
  justify-content: center;
  align-items: center;
  word-break: break-all;
  text-transform: uppercase;
  font-weight: bold;
  font-size: 16px;
  text-align: center;
  @media (max-width: 1050px) {
    font-size: 1.5vw;
  }
`

const Progress = styled.div`
  position: absolute;
  bottom: 0;
  height: 100%;
  width: 0%;
  opacity: 40%;
  background: black;
  z-index: 3;
  animation: 1s linear;
  ${props=>props.gameTimer === 1 && 'animation-name: bar;'}
  @keyframes bar {
    from {
      width: 0%;
    }
  
    to {
      width: 100%;
    }
`

const RoundColors = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  display: flex;
  z-index: 1000;
`

const RoundColor = styled.div`
  background: #${props=>props.color};
  width: 10px;
  height: 10px;
  border-radius: 50%;
  overflow: hidden;
  margin: 5px;
`
