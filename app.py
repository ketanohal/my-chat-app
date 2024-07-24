from flask import Flask, render_template, request, redirect, url_for, session, jsonify
from flask_pymongo import PyMongo
from flask_socketio import SocketIO, emit
from config import Config

app = Flask(__name__)
app.config.from_object(Config)
mongo = PyMongo(app)
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='eventlet')

@app.route('/')
def home():
    return redirect(url_for('login'))

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        user = mongo.db.chat_user.find_one({'username': username})
        if user and user['password'] == password:
            session['username'] = username
            return redirect(url_for('chat'))
        else:
            return redirect(url_for('login', error='Invalid credentials'))
    return render_template('login.html', error=request.args.get('error'))

@app.route('/register', methods=['POST'])
def register():
    data = request.form
    username = data.get('username')
    password = data.get('password')
    if mongo.db.chat_user.find_one({'username': username}):
        return jsonify({'error': 'User already exists'}), 400
    mongo.db.chat_user.insert_one({'username': username, 'password': password})
    return jsonify({'message': 'User created successfully'}), 201

@app.route('/register')
def register_page():
    return render_template('register.html')


@app.route('/logout')
def logout():
    session.pop('username', None)  # Remove username from session
    return redirect(url_for('login', logout='success'))
# Redirect to login page
@app.route('/chat')
def chat():
    if 'username' not in session:
        return redirect(url_for('login'))
    return render_template('chat.html')

@socketio.on('send_message')
def handle_send_message(data):
    username = session.get('username')
    message = data.get('message')
    if not username or not message:
        emit('error', {'error': 'Username or message missing'})
        return
    mongo.db.chat.insert_one({'username': username, 'message': message})
    emit('receive_message', {'username': username, 'message': message}, broadcast=True)

@socketio.on('fetch_messages')
def handle_fetch_messages():
    messages = mongo.db.chat.find()
    message_list = [{'username': msg['username'], 'message': msg['message']} for msg in messages]
    emit('messages', message_list)

if __name__ == '__main__':
    socketio.run(app, debug=True)

