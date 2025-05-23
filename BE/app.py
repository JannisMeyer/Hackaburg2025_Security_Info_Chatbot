from flask import Flask, render_template
from flask_socketio import SocketIO, emit, send

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your_secret_key_here'  # replace it with env later
socketio = SocketIO(app, async_mode='eventlet', cors_allowed_origins="*")


@socketio.on('message')
def handle_message(data):
    print('received message: ' + data)
    send('my_responsea' + data)


@socketio.on('my_event')
def handle_my_event(json):
    print('received json: ' + str(json))
    emit('my_response', json)

@socketio.on('disconnect')
def test_disconnect():
    print('Client disconnected')


if __name__ == '__main__':
    socketio.run(app, debug=True, host='0.0.0.0', port=5001)
    