const express = require('express');
const app = express();
const http = require('http');
const { Server } = require('socket.io');
const ACTIONS = require('../shared/Actions.Server');
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

const userSocketMap = {}; //use to stored the sockets of all users, for production, use a DB
function getAllClients(roomId) {
  return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map((socketId) => {
    return {
      socketId,
      username: userSocketMap[socketId]
    }
  });
}

app.get('/', (req, res) => {
  res.send('Server is running');
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on(ACTIONS.JOIN, ({ roomId, username }) => {
    console.log("JOIN HIT:", roomId, username);

    userSocketMap[socket.id] = username;
    socket.join(roomId);

    const clients = getAllClients(roomId);
    clients.forEach(({ socketId }) => {
      io.to(socketId).emit(ACTIONS.JOINED, {
        clients,
        username: userSocketMap[socket.id],
        socketId: socket.id,
      });
    });
  });

  socket.on(ACTIONS.CODE_CHANGE, ({ roomId, code }) => {
    // console.log(code);
    socket.in(roomId).emit(ACTIONS.CODE_CHANGE,{
     code,
    })
  })


  socket.on(ACTIONS.SYNC_CODE, ({ socketId, code }) => {
    io.to(socketId).emit(ACTIONS.SYNC_CODE,{
     code,
    })
  })



  socket.on('disconnecting', () => {
    const rooms = [...socket.rooms];
    rooms.forEach((roomId) => {
      socket.in(roomId).emit(ACTIONS.DISCONNECTED, {
        socketId: socket.id,
        username: userSocketMap[socket.id]
      });
    });
    delete userSocketMap[socket.id];
    socket.leave();
  })



});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Listening on ${PORT}`);
});