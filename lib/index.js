var net = require('net');
var colors = require('colors');
var Carbon = require('./carbon.js');


module.exports = {
  initClient: function(address, port, directory, cb) {
    var createClient = function(address, port, directory, cb) {
        // create client
        var socket = new net.Socket();
        socket.connect(port, address, function() {
          // successfully connected
          socket.client = true;

          _init(socket, directory, cb);
        });
        socket.on('error', function(err) {
          console.log(colors.red('Error: Could not connect to ' + address));
        });
    };

    // same router
    if (/^\d+$/.test(address) && address.indexOf('.') < 0) {
      getIpAddress(function(err, add, fam) {
        var parts = add.split('.');
        parts.pop();
        address = parts.join('.') + '.' + address;
        createClient(address, port, directory, cb);
      });
    }
    // full ip address
    else {
      createClient(address, port, directory, cb);
    }
  },
  initServer: function(address, port, directory, cb) {
    // create server
    var server = net.createServer(function(socket) {
      // new client joined
      socket.client = false;

      _init(socket, directory, cb);
    });

    server.listen(port, address, function() {
      // server started
      // get ip address
      getIpAddress(function (err, add, fam) {
        var parts = add.split('.')
        var local = parts[parts.length - 1]
        console.log(`Server is running on ${add}:${port}. Local WiFi address is ${local}`);
      });
    });
  },
};

// private functions

function getIpAddress(cb) {
  require('dns').lookup(require('os').hostname(), cb);
};

/** Initializes connection on a socket. */
function _init(socket, directory, cb) {
  socket.name = socket.remoteAddress + ":" + socket.remotePort;

  console.log(colors.green(`Connected to ${(socket.client ? 'server' : 'client')} ${socket.name}!`));

  var carbon = new Carbon(socket, directory);

  socket.on('close', function() {
    console.log(colors.green('Connection closed ' + socket.name));
  });

  if (cb) cb(carbon);
};
