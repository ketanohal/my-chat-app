from flask import Blueprint, render_template, request, jsonify, session
from flask_pymongo import PyMongo

chat_routes = Blueprint('chat_routes', __name__)

mongo = PyMongo()  # Initialize later with app

@chat_routes.route('/chat')
def chat():
    if 'username' not in session:
        return redirect(url_for('auth_routes.login'))
    return render_template('chat.html')

@chat_routes.route('/send_message', methods=['POST'])
def send_message():
    data = request.get_json()
    username = session.get('username')
    message = data.get('message')
    
    if not username or not message:
        return jsonify({'error': 'Username or message missing'}), 400
    
    mongo.db.chat.insert_one({'username': username, 'message': message})
    return jsonify({'message': 'Message sent successfully'}), 201

@chat_routes.route('/fetch_messages', methods=['GET'])
def fetch_messages():
    messages = mongo.db.chat.find()
    message_list = [{'username': msg['username'], 'message': msg['message']} for msg in messages]
    return jsonify(message_list), 200
