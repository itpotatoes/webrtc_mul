const express = require('express')
const app = express()
//const server = require('http').Server(app)
// const = require('socket.io')
const { v4: uuidV4 } = require('uuid')
const https = require('https')
var fs = require('fs');
const HTTPS_PORT = 8496;


const privateKey = fs.readFileSync("./key/privkey.pem")
const certificate = fs.readFileSync("./key/cert.pem")
const ca = fs.readFileSync("./key/chain.pem")
const credentials = { key: privateKey, cert: certificate, ca: ca }

const server = https.createServer(credentials, app)
const cors = require('cors');
app.use(cors())

const io = require('socket.io')(server)

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.set('view engine', 'ejs')
app.use(express.static('public'))

app.get('/', (req, res) => {
    res.redirect(`/${uuidV4()}`)
})

app.get('/:room', (req, res) => {
    res.render('room', { roomId: req.params.room })
})

io.on('connection', socket => {
    socket.on('join-room', (roomId, userId) => {
        socket.join(roomId)
        // socket.to(roomId).broadcast.emit('user-connected', userId)
        socket.broadcast.to(roomId).emit('user-connected',userId)
        socket.on('disconnect', () => {
            // socket.to(roomId).broadcast.emit('user-disconnected', userId)
            socket.broadcast.to(roomId).emit('user-disconnected',userId)
        })
    })
})

server.listen(3000)