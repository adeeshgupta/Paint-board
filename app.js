const express = require("express");
const socket = require("socket.io");
const app = express(); //initialize and server ready

app.use(express.static("public"));

let port = process.env.port || 3000;
let server = app.listen(port, () => {
    console.log("Listening to port " + port);
})

let io = socket(server);
io.on("connection", (socket) => {
    console.log("Connection established");
    // data recieved by server
    socket.on("beginPath", (data) => {
        // data sending to other computers
        io.sockets.emit("beginPath", data);
    })
    
    socket.on("drawStroke", (data) => {
        io.sockets.emit("drawStroke", data);
    })

    socket.on("redoUndo", (data) => {
        io.sockets.emit("redoUndo", data);
    })
})