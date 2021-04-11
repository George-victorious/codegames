require('dotenv').config();
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const port = process.env.PORT;
const server = require('http').createServer(app)
const io = require('socket.io')(server,{
  transports: ['websocket']
});
const uri = `mongodb+srv://admin:admin@cluster0.ugdpn.mongodb.net/codnames?retryWrites=true&w=majority`
mongoose.connect(uri,{useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false})
  .then( () => {
      console.log('Connected to database')
  })
  .catch( (err) => {
      console.error(`Error connecting to the database. \n${err}`);
  })
  
server.listen(port, ()=>{console.log(`listening on port ${port}`)});

let users = {}
let room = {
  admin: null,
  size: 6,
  customWords: false,
  timeToThink: 60,
  timeToAnswer: 60,
  timeByCorrectAnswer: 15,
  teams: 2,
  traitorMode: false,
  gotWords: false,
  redWords: [],
  blueWords: [],
  greenWords: [],
  redMaster: [],
  blueMaster: [],
  greenMaster: [],
  red: [],
  blue: [],
  green: [],
  white: [],
  gameStarted: false,
  gamePaused: false,
  gameOver: false,
  teamTurn: 'red',
  teamWordsClicked: [],
  timeBeforeOpenCard: 1500,
  redWordsLeft: 12,
  blueWordsLeft: 12,
  greenWordsLeft: 12,
}
let timeoutID;
let wordChosen = null;
let globaleTime = {timeToThinkLeft: 60, timeToAnswerLeft: 60, MasterTime: true, MasterTurn: true}
let arrayToPlay = []
let arrayToMaster = []

const wordShema = new Schema({
  ru:{
    type: String,
    required: true,
    unique: true
  },
  en:{
    type: String,
    required: true,
    unique: true
  },
  custom:{
      type: Boolean,
      required: true
  }
});

const timer = () => {
  const timer = setInterval(() => {
    if(globaleTime.MasterTurn && globaleTime.MasterTime) {
      globaleTime.timeToThinkLeft--;
      if(globaleTime.timeToThinkLeft === 0) {
        globaleTime.MasterTime = false;
      }
    } else {
      globaleTime.timeToAnswerLeft--;
      if(globaleTime.timeToAnswerLeft === 0) {
        globaleTime.teamTurn = (room.teamTurn === 'red' ? 'blue' : 'red');
        globaleTime.MasterTurn = true;
        globaleTime.MasterTime = true;
        globaleTime.timeToThinkLeft = room.timeToThink;
        globaleTime.timeToAnswerLeft = room.timeToAnswer;
      }
    }
    io.emit('globaleTime', globaleTime);
    !room.gameStarted && clearInterval(timer);
  }, 1000)
}

app.get('/getPort', async (req, res) => {
  res.status(200).json({ port: process.env.PORT })
})

app.post('/addWord', async (req, res) => {
  const currentScema = mongoose.model('words',wordShema);
  const Wordbd = await currentScema.findOne({
      ru: req.body.word.ru
  });
  try {
    if (!Wordbd) {
      const newWord = new currentScema(word);
      await newWord.save();
      res.status(201).json({ msg: 'Слово успешо добавлено.' })
    } else {
      res.status(200).json({ msg: 'Слово уже существует.' })
    }
  } catch (err) {
    res.status(200).json({ msg: 'Ошибка!', error: err })
  }
})

const roomNeedForAdmin = () => {
  const arraysEmpty = 
  !!room.red[0]
    || !!room.blue[0]
    || !!room.green[0]
    || !!room.white[0]
    || !!room.redMaster[0]
    || !!room.blueMaster[0]
    || !!room.greenMaster[0]
      ? false
      : true
  return arraysEmpty
}

const getRandomColor = () => {
  var letters = '0123456789ABCDEF';
  var color = '';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

const normalDate = () => {
  function addZero (date) {
    if(String(date).length === 1) {
      return `0${date}`
    } else {
      return date
    }
  }
  const Fulldate = new Date();
  const date = addZero(Fulldate.getDate());
  const mount = addZero(Fulldate.getMonth()+1);
  const year = addZero(Fulldate.getFullYear());
  const hour = addZero(Fulldate.getHours());
  const minute = addZero(Fulldate.getMinutes());
  const second = addZero(Fulldate.getSeconds());
  return date+'.'+mount+'.'+year+' в '+hour+':'+minute+':'+second;
}

const setUsername = (client, username) => {
  console.log(`${username} присоеденился к серверу ${normalDate()};`);
  const needAdmin = roomNeedForAdmin() ;
  const user = {
    id: client.id,
    name: username,
    isAdmin: needAdmin,
    isMaster: false,
    personalColors: getRandomColor(),
    team: 'white'
  }
  users[client.id] = user;
  room.white.push(user);
  if(needAdmin){
    room.admin = client.id;
  }
  io.emit('room', room);
  if(room.gotWords) {
    io.to(client.id).emit('words', (users[client.id])['isMaster'] ? arrayToMaster : arrayToPlay)
  }
  io.to(client.id).emit('getId', client.id)
}

const startGame = (client) => {
  if(!room.gameStarted && client.id === room.admin && room.gotWords){
    if(room.red.length > 0 && room.blue.length > 0 && room.redMaster.length > 0 && room.blueMaster.length > 0){
      room.gameStarted = true;
      io.emit('room', room);
      timer();
    }
  }
}

const becomePlayer = (client,newTeam) => {
  if(!room.gameStarted && (users[client.id])){
    const myTeam = (users[client.id])['team'];
    if (myTeam !== newTeam || (users[client.id])['isMaster']) {
      (users[client.id])['team'] = newTeam;
      (users[client.id])['isMaster'] = false;
      room[newTeam].push(users[client.id]);
      let myIndex = null
      if(myTeam === 'white') {
        myIndex = room[myTeam].findIndex(n => n.id === client.id);
      } else {
        myIndex = room[`${myTeam}Master`].findIndex(n => n.id === client.id);
      }
      if (myIndex !== -1 && myTeam !== 'white') {
        room[`${myTeam}Master`] = [];
      } else {
        room[myTeam].splice(myIndex, 1);
      }
      if(room.gotWords) {
        io.to(client.id).emit('words', arrayToPlay)
      }
      io.emit('room', room);
    }
  }
}

const becomeMaster = (client,newTeam) => {
  if(!room.gameStarted){
    const myTeam = (users[client.id])['team']
    if (!room[`${newTeam}Master`].length) {
      (users[client.id])['team'] = newTeam;
      (users[client.id])['isMaster'] = true;
      room[`${newTeam}Master`].push(users[client.id]);
      const myIndex = room[myTeam].findIndex(n => n.id === client.id);
      if (myIndex !== -1) {
        room[myTeam].splice(myIndex, 1);
      } else {
        room[`${myTeam}Master`] = [];
      }
      if(room.gotWords) {
        io.to(client.id).emit('words', arrayToMaster)
      }
      io.emit('room', room);
    }
  }
}

const createWordList = async () => {
  const currentScema = mongoose.model('words',wordShema);
  const randomWords = await currentScema.aggregate([{ $sample: { size: room.size*room.size } },{ $match: { custom: room.customWords} }])
  arrayToPlay = [];
  arrayToMaster = [];
  randomWords.map((word,i) => arrayToMaster.push({...word, isClicked: false, team: i === 0 ? 'black' : i<=2*room.size ? 'red' : i<=4*room.size ? 'blue' : 'white'}));
  arrayToMaster.sort((a,b)=>Math.random() - 0.5)
  arrayToMaster.map((word,i) => arrayToPlay.push({...word, team: 'white'}));
}

const newWords = async (client) => {
  if(!room.gameStarted && client.id === room.admin){
    await createWordList();
    room = {...room,
      redWordsLeft: 2*room.size,
      blueWordsLeft: 2*room.size,
      greenWordsLeft: 2*room.size,
      gotWords: true,
      redWords: [],
      blueWords: [],
      greenWords: []
    }
    globaleTime = {...globaleTime,
      timeToThinkLeft: room.timeToThink,
      timeToAnswerLeft: room.timeToAnswer,
      MasterTime: true,
      MasterTurn: true
    }
    Object.keys(users).map(
      user => io.to(user).emit('words', (users[user])['isMaster'] ? arrayToMaster : arrayToPlay)
    );
    io.emit('room', room);
  }
}

const pauseGame = (client) => {
  if(room.gameStarted && client.id === room.admin){
    room.gameStarted = false;
    io.emit('room', room);
  }
}

const sendMessage = (client, message) => {
  globaleTime.MasterTurn = false;
  room[`${(users[client.id])['team']}Words`].push(message);
  io.emit('globaleTime', globaleTime);
  io.emit('room', room);
}

const changeSettings = (client,prop, value) => {
  if(!room.gameStarted && client.id === room.admin){
    if(prop === 'timeToAnswer' || prop === 'timeToThink' || prop === 'timeByCorrectAnswer'){
      if(value > 4 && value < 99){
        room[prop] = value;
        io.emit('room', room);
      }
    } else {
      room[prop] = value;
      io.emit('room', room);
    }
  }
}

const openCard = (buttonIndex) => {
  if(wordChosen !== null) {
    arrayToMaster[buttonIndex].isClicked = true;
    arrayToPlay[buttonIndex] = arrayToMaster[buttonIndex];
    if(arrayToMaster[buttonIndex].team === room.teamTurn){
      room[`${arrayToMaster[buttonIndex].team}WordsLeft`]--;
      globaleTime.timeToAnswerLeft+=room.timeByCorrectAnswer;
    } else if(arrayToMaster[buttonIndex].team === 'black') {
      gameOver();
    } else {
      room[`${arrayToMaster[buttonIndex].team}WordsLeft`]--;
      room = {...room,
        teamTurn: room.teamTurn === 'red' ? 'blue' : 'red',
        teamWordsClicked: []
      }
      globaleTime = {...globaleTime,
        MasterTurn: true,
        MasterTime: true,
        timeToThinkLeft: room.timeToThink,
        timeToAnswerLeft: room.timeToAnswer
      }
    }
    if(!room.redWordsLeft || !room.blueWordsLeft || !room.greenWordsLeft) {
      gameOver();
    }
    io.emit('room', room);
    if(room[`${arrayToMaster[buttonIndex].team}WordsLeft`] === 0) {
      room = {...room,
        gameStarted: false,
        gotWords:false
      }
      arrayToPlay = arrayToMaster;
    }
    Object.keys(users).map(
      user => io.to(user).emit('words', (users[user])['isMaster'] ? arrayToMaster : arrayToPlay)
    )
  }
}

const addChosenWord = (client,buttonIndex) => {
  const index = room.teamWordsClicked.findIndex(n => n.user === client.id);
  if (index === -1) {
    room.teamWordsClicked.push({user: client.id, color: users[client.id].personalColors, id: buttonIndex})
  } else {
    const bi = room.teamWordsClicked[index].id;
    room.teamWordsClicked.splice(index, 1);
    if(bi !== buttonIndex) {
      room.teamWordsClicked.push({user: client.id, color: users[client.id].personalColors, id: buttonIndex})
    }
  }
}

const chosenWordCorrect = () => {
  if(room.teamWordsClicked.length === room[room.teamTurn].length ||
    room[room.teamTurn].length === 1){
    for (let i = 0; i < room.teamWordsClicked.length - 1; i++) {
      if(room.teamWordsClicked[i].id !== room.teamWordsClicked[i + 1].id) {
        return false;
      }
    }
  } else {
    return false;
  }
  return true
}

const clickButton = (client, buttonIndex) => {
  if(!(users[client.id])['isMaster']) {
    if(room.teamTurn === (users[client.id])['team'] && !arrayToPlay[buttonIndex].isClicked && room.gameStarted && !globaleTime.MasterTurn) {
      if(room[room.teamTurn].length > 1) {
        addChosenWord(client,buttonIndex);
      }
      wordChosen = chosenWordCorrect() ? buttonIndex : null;
      io.emit('wordChosen', wordChosen);
      if(wordChosen !== null){
        clearTimeout(timeoutID);
        timeoutID = setTimeout(()=>openCard(buttonIndex), 1000);
        } else {
          clearTimeout(timeoutID)
          io.emit('room', room);
        }
    } else {
      io.emit('buttonClicked', buttonIndex,client.id);
    }
  }
}

const gameOver = () => {
  room.gameStarted = false;
  room.gotWords = false;
  arrayToPlay = arrayToMaster;
}

const disconnect = (client) => {
  if(users[client.id]) {
    const team = (users[client.id])['team'];
    const index = room[team].findIndex(n => n.id === client.id);
    console.log(`${(users[client.id])['name']} отключился ${normalDate()};`);
    if (index !== -1) {
      room[team].splice(index, 1);
    } else {
      room[`${team}Master`] = [];
    }
    delete users[client.id];
    room.admin = Object.values(users)[0] ? (Object.values(users)[0]).id : null;
  }
  io.emit('room', room);
}

io.on('connection', client => {
  client.on('username', username => {
    setUsername(client,username);
  })

  client.on('becomePlayer', newTeam => {
    becomePlayer(client,newTeam);
  })

  client.on('becomeMaster', newTeam => {
    becomeMaster(client,newTeam);
  })

  client.on('newWords', () => {
    newWords(client);
  })

  client.on('startGame', () => {
    startGame(client);
  })

  client.on('pauseGame', () => {
    pauseGame(client);
  })

  client.on('send', message => {
    sendMessage(client,message);
  })

  client.on('settings', (prop, value) => {
    changeSettings(client, prop, value);
  })

  client.on('clickButton', (buttonIndex) => {
    clickButton(client, buttonIndex);
  })

  client.on('disconnect', () => {
    room.gameStarted && gameOver();
    disconnect(client);
  })
})
