/* eslint-env es6 */

/*
 * Dependencies
 */
const express = require('express');
const http = require("http");
const session = require('express-session');
const cp = require('cookie-parser');

/*
 * Config
 */
const app = express();
const port = process.env.PORT || 3000;
app.use(express.static(`${__dirname}`));
app.use(cp());
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
 * cookies
 */

// app.get('/set', (req, res) => {
//   // Set the new style cookie
//   res.cookie('3pcookie', 'value', { sameSite: 'None', secure: true });
//   // And set the same value in the legacy cookie
//   res.cookie('3pcookie-legacy', 'value', { secure: true });
//   res.end();
// });

// app.get('/', (req, res) => {
//   let cookieVal = null;

//   if (req.cookies['3pcookie']) {
//     // check the new style cookie first
//     cookieVal = req.cookies['3pcookie'];
//   } else if (req.cookies['3pcookie-legacy']) {
//     // otherwise fall back to the legacy cookie
//     cookieVal = req.cookies['3pcookie-legacy'];
//   }

//   res.end();
// });

//-- Other option

const sessionConfig = {
  secret: 'MYSECRET',
  name: 'appName',
  resave: false,
  saveUninitialized: false,
  cookie : {
    sameSite: 'none', // THIS is the config you are looing for.
  }
};

if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1); // trust first proxy
  sessionConfig.cookie.secure = true; // serve secure cookies
}

app.use(session(sessionConfig));


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

