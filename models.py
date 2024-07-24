from flask import current_app
from werkzeug.security import generate_password_hash, check_password_hash

class User:
    @staticmethod
    def find_user(username):
        db = current_app.extensions['pymongo'].db
        return db.users.find_one({'username': username})

    @staticmethod
    def create_user(username, password):
        db = current_app.extensions['pymongo'].db
        db.users.insert_one({
            'username': username,
            'password': generate_password_hash(password)
        })
