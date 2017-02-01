
// !!!!!!!!!WEBSOCKET SECTION!!!!!!!!!!
var socketio = io.connect('http://127.0.0.1:8080');
// var socketio = io.connect('http://www.michaelirby.com/chat-draw');

socketio.on('users', (socketUsers)=>{
	var newHTML = "";
	socketUsers.map((currSocket, index) =>{
		newHTML += '<li class="user">' + currSocket.name + '</li>';
	});
	document.getElementById('userNames').innerHTML = newHTML;
});

socketio.on('messageToClient', (messageObject)=>{
	document.getElementById('userChats').innerHTML += '<div class="message">' +  messageObject.message + ' -- ' + messageObject.date + '</div>';
});


// !!!!!!!!!CLIENT FUNCTIONS!!!!!!!!!!
function sendChatMessage(){
	event.preventDefault();
	var messageToSend = document.getElementById('chat-message').value;
	socketio.emit('messageToServer', {
		message: messageToSend,
		name: "Anonymous"
	});
}

function contextDraw(){
	context.strokeStyle = color;
	context.lineJoin = 'round';
	context.lineCap = 'round';
	context.lineWidth = thickness;
	context.beginPath();
	context.moveTo(lastMousePosition.x, lastMousePosition.y);
	context.lineTo(mousePosition.x, mousePosition.y);
	context.stroke();
	context.closePath();
}


// !!!!!!!!!CANVAS!!!!!!!!!!
var canvas = document.getElementById('canvas');
var context = canvas.getContext('2d');

// Set up base options
var color = "#000";
var thickness = 10;
var mouseDown = false;
var mousePosition = {};
var lastMousePosition = null;
var colorPick = document.getElementById('color-picker');
var thicknessPicker = document.getElementById('thickness');

colorPick.addEventListener('change', (event)=>{
	color = colorPick.value;
})

thicknessPicker.addEventListener('change', (event)=>{
	thickness = thicknessPicker.value;
})

canvas.addEventListener('mousedown', (event)=>{
	console.log(event);
	mouseDown = true;
});

canvas.addEventListener('mouseup', (event)=>{
	mouseDown = false;
	lastMousePosition = null;
});

canvas.addEventListener('mousemove', (event)=>{
	if(mouseDown){
		// mouse must be down because we update this boolean in mousedown/mouseup
		var magicBrushX = event.pageX - canvas.offsetLeft;
		var magicBrushY = event.pageY - canvas.offsetTop;
		mousePosition = {
			x: magicBrushX,
			y: magicBrushY
		}
		// console.log(mousePosition);
		if(lastMousePosition !== null){
			contextDraw();
		}

		var drawingDataForServer = {
			mousePosition: mousePosition,
			lastMousePosition: lastMousePosition,
			color: color,
			thickness: thickness
		}

		// update lastMousePosition
		lastMousePosition = {
			x: mousePosition.x,
			y: mousePosition.y
		}

		socketio.emit('drawingToServer', drawingDataForServer);

		socketio.on('drawingToClients', (drawingData)=>{
			contextDraw();
		});
	}
});




