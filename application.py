import os

from flask import Flask, render_template, request, jsonify
from flask_socketio import SocketIO, emit
from datetime import datetime

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

channels = {}

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/name")
def name():
    return render_template("name.html")

# For responding to AJAX requests from JS
@app.route("/message_data", methods=["POST"])
def message_data():
    # Messages to be loaded
    start = int(request.form.get('start'))
    end = int(request.form.get('end'))
    # Return relevant data
    channel_name = request.form.get('channel')
    channel_list = list(channels.keys())
    channel_messages = channels[channel_name]['messages'][-start:-end-1:-1]
    return jsonify({'channel_list': channel_list,
                    'channel_messages': channel_messages})

# Receive Websocket event for new channel
@socketio.on("create channel")
def new_channel(data):
    channel_name = data['channel']
    # If channel does not exist yet, create and broadcast
    if channel_name not in channels.keys():
        channels[channel_name] = {'id_count':0,'messages':[]}
        emit("announce channel", {'channel':channel_name}, broadcast=True)

# Receive Websocket event for new message
@socketio.on("send message")
def new_message(data):
    # Prepare message data
    channel_name = data['channel']
    channel = channels[channel_name]
    now = datetime.now().strftime('%b %-d, %Y %-I:%M %p')
    message = {'id': str(channel['id_count']),
                'name': data['name'],
                'text': data['text'],
                'timestamp': now
    }
    # Counter for message identifier
    channels[channel_name]['id_count'] += 1
    # Limit to 100 stored messages per channel
    while len(channel['messages']) >= 100:
        del channels[channel_name]['messages'][0]
    # Create and broadcast
    channels[channel_name]['messages'].append(message)
    emit("announce message", {**message,
                            'channel': channel_name}, broadcast=True)

# Receive Websocket event for deleting messages
@socketio.on("remove message")
def remove_message(data):
    channel_name = data['channel']
    id = data['id']
    channel = channels[channel_name]
    # Delete specific message and broadcast
    channel['messages'] = [ msg for msg in channel['messages'] if msg['id'] != id ]
    emit("announce remove", {'id': id,
                            'channel': channel_name}, broadcast=True)

# Run application.py, rather than 'flask run'
if __name__ == '__main__':
    socketio.run(app)
