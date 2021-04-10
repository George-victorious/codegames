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

const users = {}
const room = {
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
  wordsChoosed: [],
  redWordsLeft: 12,
  blueWordsLeft: 12,
  greenWordsLeft: 12,
}

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
  }, 1000)
}

app.post('/getPort', async (req, res) => {
  res.status(200).json({ port: process.env.PORT })
})

app.post('/addWord', async (req, res) => {
  console.log(req.body)
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


const setUsername = (client,username) => {
  const needAdmin = (!!room.red[0] || !!room.blue[0] || !!room.green[0] || !!room.white[0] || !!room.redMaster[0] || !!room.blueMaster[0] || !!room.greenMaster[0] ? false : true) ;
  function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }
  const user = {
    id: client.id,
    name: username,
    isAdmin: needAdmin,
    isMaster: false,
    personalColors: getRandomColor(),
    team: 'white'
  }
  console.log(`${username} ${client.handshake.address.replace('::ffff:', '')} присоеденился к серверу в ${new Date()}`);
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

const newWords = async (client) => {
  if(!room.gameStarted && client.id === room.admin){
    const currentScema = mongoose.model('words',wordShema);
    const randomWords = await currentScema.aggregate([{ $sample: { size: room.size*room.size } },{ $match: { custom: room.customWords} }])
    arrayToPlay = [];
    arrayToMaster = [];
    randomWords.map((word,i) => arrayToMaster.push({...word, isClicked: false, team: i === 0 ? 'black' : i<=2*room.size ? 'red' : i<=4*room.size ? 'blue' : 'white'}));
    arrayToMaster.sort((a,b)=>Math.random() - 0.5)
    arrayToMaster.map((word,i) => arrayToPlay.push({...word, team: 'white'}));
    room.redWordsLeft = 2*room.size;
    room.blueWordsLeft = 2*room.size;
    room.greenWordsLeft = 2*room.size;
    room.gameOver = false;
    room.wordsChoosed = [];
    globaleTime.timeToThinkLeft = room.timeToThink;
    globaleTime.timeToAnswerLeft = room.timeToAnswer;
    room.redWords = [];
    room.blueWords = [];
    room.greenWords = [];
    globaleTime.MasterTime = true;
    globaleTime.MasterTurn = true;

    if(arrayToMaster.length === room.size*room.size){
      Object.keys(users).map(
        user => io.to(user).emit('words', (users[user])['isMaster'] ? arrayToMaster : arrayToPlay)
      );
      room.gotWords = true;
      io.emit('room', room);
    }
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
  io.emit('room', room);
}

const changeSettings = (client,prop, value) => {
  if(!room.gameStarted && client.id === room.admin){
    if(prop === 'timeToAnswer' || prop === 'timeToThink' || prop === 'timeByCorrectAnswer'){
      if(value > 4 && value < 99){
        console.log('1')
        room[prop] = value;
        io.emit('room', room);
      }
    } else {
      room[prop] = value;
      io.emit('room', room);
    }
  }
}

const clickButton = (client, buttonIndex) => {
  if(!(users[client.id])['isMaster']) {
    if(room.teamTurn === (users[client.id])['team'] && !arrayToPlay[buttonIndex].isClicked && room.gameStarted && !globaleTime.MasterTurn) {
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
      wordChosen = buttonIndex;
      if(room.teamWordsClicked.length === room[room.teamTurn].length){
        for (let i = 0; i < room.teamWordsClicked.length - 1; i++) {
          if(room.teamWordsClicked[i].id !== room.teamWordsClicked[i + 1].id) {
            wordChosen = null;
          }
        }
      } else {
        wordChosen = null;
      }
      var timeoutID;
      io.emit('wordChosen', wordChosen);
      if(wordChosen !== null){
        timeoutID = setTimeout(openCard, 2000);
        console.log('create')
        function openCard() {
          if(wordChosen !== null) {
            wordChosen = null;
            arrayToMaster[buttonIndex].isClicked = true;
            arrayToPlay[buttonIndex].isClicked = true;
            arrayToPlay[buttonIndex].team = arrayToMaster[buttonIndex].team === 'white' ? 'openedWhite' : arrayToMaster[buttonIndex].team;
            if(arrayToMaster[buttonIndex].team === room.teamTurn){
              room[`${arrayToMaster[buttonIndex].team}WordsLeft`]--;
              globaleTime.timeToAnswerLeft+=room.timeByCorrectAnswer;
            } else if(arrayToMaster[buttonIndex].team === 'black') {
              room.gameStarted = false;
              room.gotWords = false;
              arrayToPlay = arrayToMaster;
            } else {
              room.teamTurn = (room.teamTurn === 'red' ? 'blue' : 'red');
              room[`${arrayToMaster[buttonIndex].team}WordsLeft`]--;
              globaleTime.MasterTurn = true;
              globaleTime.MasterTime = true;
              globaleTime.timeToThinkLeft = room.timeToThink;
              globaleTime.timeToAnswerLeft = room.timeToAnswer;
            }
            room.teamWordsClicked = [];
            io.emit('room', room);
            if(room[`${arrayToMaster[buttonIndex].team}WordsLeft`] === 0) {
              room.gameStarted = false;
              room.gotWords = false;
              arrayToPlay = arrayToMaster;
            }
            Object.keys(users).map(
              user => io.to(user).emit('words', (users[user])['isMaster'] ? arrayToMaster : arrayToPlay)
              )
            }
          }
        } else {
          clearTimeout(timeoutID)
          io.emit('room', room);
        }
    } else {
      io.emit('buttonClicked', buttonIndex,client.id);
    }
  }
}

const disconnect = (client) => {
  if(users[client.id]) {
    const team = (users[client.id])['team'];
    const index = room[team].findIndex(n => n.id === client.id);
    console.log(`${(users[client.id])['name']} отключился в ${new Date()}`);
    if (index !== -1) {
      room[team].splice(index, 1);
    } else {
      room[`${team}Master`] = [];
    }
    delete users[client.id];
    room.admin = Object.values(users)[0] ? (Object.values(users)[0]).id : null;
    io.emit('room', room);
  }
}

io.on('connection', client => {
  client.on('username', username => {
    console.log('username')
    setUsername(client,username)
  })

  client.on('becomePlayer', newTeam => {
    console.log('becomePlayer')
    becomePlayer(client,newTeam)
  })

  client.on('becomeMaster', newTeam => {
    console.log('becomeMaster')
    becomeMaster(client,newTeam)
  })

  client.on('newWords', () => {
    console.log('newWords')
    newWords(client)
  })

  client.on('startGame', () => {
    console.log('startGame');
    startGame(client);
  })

  client.on('pauseGame', () => {
    console.log('pauseGame')
    pauseGame(client)
  })

  client.on('send', message => {
    console.log('send')
    sendMessage(client,message)
  })

  client.on('settings', (prop, value) => {
    console.log('settings')
    changeSettings(client, prop, value)
  })

  client.on('clickButton', buttonIndex => {
    console.log('clickButton')
    clickButton(client, buttonIndex)
  })

  client.on('disconnect', () => {
    console.log('disconnect')
    disconnect(client)
  })
})
