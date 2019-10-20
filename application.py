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

@app.route("/message_data", methods=["POST"])
def message_data():
    channel_name = request.form.get('channel')
    channel_list = list(channels.keys())
    channel_messages = channels[channel_name]['messages']
    return jsonify({'channel_list': channel_list,
                    'channel_messages': channel_messages})

@socketio.on("create channel")
def new_channel(data):
    channel_name = data['channel']
    if channel_name not in channels.keys():
        channels[channel_name] = {'id_count':0,'messages':[]}
        emit("announce channel", {'channel':channel_name}, broadcast=True)

@socketio.on("send message")
def new_message(data):
    channel_name = data['channel']
    channel = channels[channel_name]
    now = datetime.now().strftime('%b %-d, %Y %-I:%M %p')
    message = {'id': str(channel['id_count']),
                'name': data['name'],
                'text': data['text'],
                'timestamp': now
    }
    channels[channel_name]['id_count'] += 1
    while len(channel['messages']) >= 100:
        del channels[channel_name]['messages'][0]
    channels[channel_name]['messages'].append(message)
    emit("announce message", {**message,
                            'channel': channel_name}, broadcast=True)

@socketio.on("remove message")
def remove_message(data):
    channel_name = data['channel']
    id = data['id']
    channel = channels[channel_name]
    channel['messages'] = [ msg for msg in channel['messages'] if msg['id'] != id ]
    emit("announce remove", {'id': id,
                            'channel': channel_name}, broadcast=True)

if __name__ == '__main__':
    socketio.run(app)
