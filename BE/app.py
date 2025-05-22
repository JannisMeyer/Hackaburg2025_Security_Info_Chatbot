from flask import Flask, render_template
from flask_socketio import SocketIO, emit, send

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your_secret_key_here' # Change this!
socketio = SocketIO(app, async_mode='eventlet') # or 'gevent' or None for default

@app.route('/')
def index():
    return """
    <!DOCTYPE html>
    <html>
    <head>
        <title>Flask SocketIO Test</title>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/4.0.0/socket.io.js"></script>
        <script type="text/javascript" charset="utf-8">
            document.addEventListener('DOMContentLoaded', (event) => {
                var socket = io();

                socket.on('connect', function() {
                    console.log('Connected to SocketIO server');
                    socket.emit('my_event', {data: 'I\'m connected!'});
                });

                socket.on('my_response', function(msg) {
                    console.log('Received:', msg.data);
                });

                document.getElementById('send_button').onclick = function() {
                    var message = document.getElementById('message_input').value;
                    socket.emit('my_event', {data: message});
                };
            });
        </script>
    </head>
    <body>
        <h1>Flask SocketIO Test</h1>
        <input type="text" id="message_input" placeholder="Type a message">
        <button id="send_button">Send</button>
    </body>
    </html>
    """

@socketio.on('message')
def handle_message(data):
    print('received message: ' + data)
    send('my_responsea' + data) # Echo back the received data


@socketio.on('my_event')
def handle_my_event(json):
    print('received json: ' + str(json))
    emit('my_response', json) # Echo back the received data

@socketio.on('disconnect')
def test_disconnect():
    print('Client disconnected')

if __name__ == '__main__':
    socketio.run(app, debug=True, host='0.0.0.0', port=5001)
    