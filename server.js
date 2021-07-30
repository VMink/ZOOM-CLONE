const express = require('express'); //LLAMAMOS A EXPRESS
const app = express(); 
const server = require('http').Server(app)
const { v4: uuidv4 } = require('uuid'); //LLAMAMOS EL GENERADOR DE IDS
const io = require('socket.io')(server);
const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server, {
  debug: true
});

app.use('/peerjs', peerServer);

app.set('view engine', 'ejs'); //DEFINIMOS EL ENGINE PARA LOS REDERS DE LAS RUTAS

app.use(express.static('public')) //DECLARAMOS DONDE VAN A ESTAR NUESTROS SCRIPTS

//CREAMOS LA ID UNICA DE LOS ROOMS
app.get('/', (req, res) => {
    res.redirect(`/${uuidv4()}`);
})

//CREAMOS LOS ROOMS
app.get('/:room',  (req, res) => {
    res.render('room', { roomId: req.params.room });
})

io.on('connection', socket => {
    socket.on('join-room', (roomId, userId) => {
        socket.join(roomId);
        socket.to(roomId).emit('user-connected', userId)
        socket.on('message', (message) => {
            io.to(roomId).emit('createMessage', message)
        })
    })
})

server.listen(process.env.PORT||3030)