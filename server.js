/* eslint-env es6 */

/*
 * Dependencies
 */
const express = require('express');
const http = require("http");

/*
 * Config
 */
const app = express();
const port = process.env.PORT || 3000;
app.use(express.static(`${__dirname}`));
const server = http.createServer(app);

/*
 * User Routes
 */

app.get('/', (req, res) => {    // Direct traffic to splash screen first
  res.redirect('/index.html');
});

app.get('*', (req, res) => {
  res.redirect('/');
});





/*
 * socket.io
 */

server.listen(port);

// Setup sockets with the HTTP server
const io = require('socket.io')(http);
console.log(`Listening for socket connections on port ${port}`);


// Register a callback function to run when we have an individual connection
// This is run for each individual client that connects
io.sockets.on('connection',
  // Callback function to call whenever a socket connection is made
  function (socket) {
    // Print message to the console indicating that a new client has connected
    console.log("New client: " + socket.id);


    socket.on('mode',
    function(data) {
       console.log("mode :" + data);
        socket.broadcast.emit('mode', data);
      }
    );

    
    // Specify a callback function to run when the client disconnects
    socket.on('disconnect',
      function() {
        console.log("Client has disconnected: " + socket.id);
      }
    );
  }
);

