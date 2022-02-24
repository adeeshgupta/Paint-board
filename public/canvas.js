let canvas = document.querySelector("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let pencilColorAll = document.querySelectorAll(".pencil-color");
let pencilWidthElem = document.querySelector(".pencil-width");
let eraserWidthElem = document.querySelector(".eraser-width");
let download = document.querySelector(".download");
let redo = document.querySelector(".redo");
let undo = document.querySelector(".undo");

let tool = canvas.getContext("2d");

let mouseDown = false;
let pencilColor = "black";
let eraserColor = "white";
let pencilWidth = pencilWidthElem.value;
let eraserWidth = eraserWidthElem.value;

let undoRedoTracker = []; //Data
let track = 0; //Represent which action from tracker array

tool.strokeStyle = pencilColor; //color of line
tool.lineWidth = pencilWidth; //thickness of line

canvas.addEventListener("mousedown", (e) => {
    mouseDown = true;
    //beginPath({ x: e.clientX, y: e.clientY });
    let data = { x: e.clientX, y: e.clientY };
    socket.emit("beginPath", data); // data emitted to server
})

canvas.addEventListener("mouseup", (e) => {
    mouseDown = false;
    let url = canvas.toDataURL();
    undoRedoTracker.push(url);
    track = undoRedoTracker.length-1;
})

canvas.addEventListener("mousemove", (e) => {
    if (mouseDown) {
        let data = {
            x: e.clientX,
            y: e.clientY,
            color: eraserFlag ? eraserColor : pencilColor,
            width: eraserFlag ? eraserWidth : pencilWidth
        }
        socket.emit("drawStroke", data);
        // drawStroke({
        //     x: e.clientX,
        //     y: e.clientY,
        //     color: eraserFlag ? eraserColor : pencilColor,
        //     width: eraserFlag ? eraserWidth : pencilWidth
        // });
    }
})

pencilColorAll.forEach((colorElem) => {
    colorElem.addEventListener("click", (e) => {
        let color = colorElem.classList[0];
        pencilColor = color;
        tool.strokeStyle = pencilColor;
    })
})

pencilWidthElem.addEventListener("change", (e) => {
    pencilWidth = pencilWidthElem.value;
    tool.lineWidth = pencilWidth;
})

eraserWidthElem.addEventListener("change", (e) => {
    eraserWidth = eraserWidthElem.value;
    tool.lineWidth = eraserWidth;
})

eraser.addEventListener("click", (e) => {
    if (eraserFlag) {
        tool.strokeStyle = eraserColor;
        tool.lineWidth = eraserWidth;
    }
    else {
        tool.strokeStyle = pencilColor;
        tool.lineWidth = pencilWidth;
    }
})

download.addEventListener("click", (e) => {
    let url = body.toDataURL(); 
    let a = document.createElement("a");
    a.href = url;
    a.download = "board.jpg";
    a.click();
})

undo.addEventListener("click", (e) => {
    if(track > 0)
        track--;
    let data = {
        track,
        undoRedoTracker
    };
    socket.emit("redoUndo", data);
    // undoRedoCanvas(data);
})

redo.addEventListener("click", (e) => {
    if(track < undoRedoTracker.length-1)
        track++;
    let data = {
        track,
        undoRedoTracker
    };
    socket.emit("redoUndo", data);
    // undoRedoCanvas(data);
})

function undoRedoCanvas (trackObj) {
    track = trackObj.track;
    undoRedoTracker = trackObj.undoRedoTracker;
    let url = undoRedoTracker[track];
    let img = new Image();
    img.src = url;
    img.onload = (e) => {
        tool.drawImage(img, 0, 0, canvas.width, canvas.height);
    }
}

function beginPath(strokeObj) {
    tool.beginPath(); //start the tool to draw on canvas
    tool.moveTo(strokeObj.x, strokeObj.y); //starting point
}

function drawStroke(strokeObj) {
    tool.strokeStyle = strokeObj.color;
    tool.lineWidth = strokeObj.width;
    tool.lineTo(strokeObj.x, strokeObj.y); //ending point
    tool.stroke(); //draw line
}

socket.on("beginPath", (data) => {
    // data recieved from server
    beginPath(data);
})

socket.on("drawStroke", (data) => {
    // data recieved from server
    drawStroke(data);
})

socket.on("redoUndo", (data) => {
    undoRedoCanvas(data);
})