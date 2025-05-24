from flask import Flask, request
from flask_socketio import SocketIO, emit, send
from src.fe_interface import App
from src.database import get_product_vulnerability, get_list_of_products


app = Flask(__name__)
app.config["SECRET_KEY"] = "your_secret_key_here"  # replace it with env later
socketio = SocketIO(app, cors_allowed_origins="*")

llm = App([get_product_vulnerability, get_list_of_products])


@socketio.on("message")
def handle_message(data):
    client_id = request.sid
    data = str(data)
    llm_res = llm.query(data, client_id)
    print("received message: " + data)
    print(type(llm_res))
    print(llm_res)
    emit("message", {"from": "user", "text": llm_res})


@socketio.on("my_event")
def handle_my_event(json):
    print("received json: " + str(json))
    emit("my_response", json)


@socketio.on("disconnect")
def test_disconnect():
    print("Client disconnected")


if __name__ == "__main__":
    socketio.run(app, debug=True, host="0.0.0.0", port=5001)
