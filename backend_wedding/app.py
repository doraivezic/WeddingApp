from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_migrate import Migrate
from werkzeug.security import generate_password_hash, check_password_hash
from flask import Flask, send_from_directory
from sqlalchemy import ForeignKeyConstraint
import os

# app = Flask(__name__)
app = Flask(__name__, static_folder="../frontend_wedding/build")
CORS(app)  # Enable CORS
basedir = os.path.abspath(os.path.dirname(__file__))
# app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'app.db')
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://weddingdatabase_6t11_user:i3g08Y2kxei2BbxxyhenH6oFQHQXFyjO@dpg-ctnj38lumphs73c79nbg-a.frankfurt-postgres.render.com/weddingdatabase_6t11'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

migrate = Migrate(app, db)  # Initialize Flask-Migrate

@app.route('/')
def serve():
    return send_from_directory(app.static_folder, 'index.html')


# -----------------------------
# 1) USER MODEL
# -----------------------------
class User(db.Model):
    __tablename__ = 'user'  # Ensure the table name is correct

    username = db.Column(db.String(80), primary_key=True)
    password_hash = db.Column(db.String(200), nullable=False)
    role = db.Column(db.String(20), nullable=False)
    personal_message = db.Column(db.String(500))

    # Relationships
    comments = db.relationship(
        'GuestComment',
        back_populates='user',
        passive_deletes=True
    )

    namesurnames = db.relationship(
        'NameSurname',
        back_populates='user',
        passive_deletes=True
    )

    responses = db.relationship(
        'FormResponse',
        back_populates='user_rel',
        foreign_keys='FormResponse.user_username',
        passive_deletes=True
    )

    # Methods
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)


# -----------------------------
# 2) NAME_SURNAME MODEL
# -----------------------------
class NameSurname(db.Model):
    __tablename__ = 'name_surname'

    user_username = db.Column(
        db.String(80),
        db.ForeignKey('user.username', ondelete='CASCADE'),
        primary_key=True
    )
    name_surname = db.Column(db.String(100), nullable=False, primary_key=True)

    # Relationship back to User
    user = db.relationship(
        'User',
        back_populates='namesurnames'
    )

    # Relationship to FormResponse
    responses = db.relationship(
        'FormResponse',
        back_populates='name_surname_rel'
    )


# -----------------------------
# 3) FORM_RESPONSE MODEL
# -----------------------------
class FormResponse(db.Model):
    __tablename__ = 'form_response'

    # Columns
    user_username = db.Column(
        db.String(80),
        db.ForeignKey('user.username', ondelete='CASCADE'),
        primary_key=True
    )
    name_surname = db.Column(db.String(100), primary_key=True)
    accepted = db.Column(db.Boolean, nullable=True)
    menu_option = db.Column(db.String(80), nullable=True)
    allergies = db.Column(db.String(500), nullable=True)
    comment = db.Column(db.String(500), nullable=True)

    # Composite Foreign Key to NameSurname
    __table_args__ = (
        ForeignKeyConstraint(
            ['user_username', 'name_surname'],
            ['name_surname.user_username', 'name_surname.name_surname'],
            ondelete='CASCADE'
        ),
    )

    # Relationship back to User
    user_rel = db.relationship(
        'User',
        back_populates='responses',
        foreign_keys=[user_username]
    )

    # Relationship back to NameSurname
    name_surname_rel = db.relationship(
        'NameSurname',
        back_populates='responses',
        foreign_keys=[user_username, name_surname]
    )


# -----------------------------
# 4) GUEST_COMMENT MODEL
# -----------------------------
class GuestComment(db.Model):
    __tablename__ = 'guest_comment'

    user_username = db.Column(
        db.String(80),
        db.ForeignKey('user.username', ondelete='CASCADE'),
        primary_key=True
    )
    comment = db.Column(db.String(500), nullable=False, primary_key=True)

    # Relationship back to User
    user = db.relationship(
        'User',
        back_populates='comments'
    )


# Create initial admin user
# with app.app_context():
#     db.create_all()
#     if not User.query.filter_by(username='admin').first():
#         admin = User(username='admin', role='admin')
#         admin.set_password('password_admin123')
#         db.session.add(admin)
#         db.session.commit()

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    user = User.query.filter_by(username=data['username']).first()
    if user and user.check_password(data['password']):
        return jsonify({'role': user.role, 'personal_message': user.personal_message, 'username': user.username}), 200
    return jsonify({'error': 'Invalid credentials'}), 401

@app.route('/api/users', methods=['GET'])
def get_users():
    users = User.query.all()
    user_list = [{'username': user.username, 'role': user.role, 'personal_message': user.personal_message} for user in users]
    return jsonify(user_list), 200

@app.route('/api/users/<username>', methods=['GET'])
def get_user(username):
    user = User.query.filter_by(username=username).first()
    if user:
        return jsonify({'username': user.username, 'personal_message': user.personal_message}), 200
    return jsonify({'error': 'User not found'}), 404

@app.route('/api/users', methods=['POST'])
def add_user():
    data = request.json
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'error': 'Username already exists'}), 400
    new_user = User(username=data['username'], role=data['role'], personal_message=data.get('personal_message', ''))  #role can be admin or guest
    new_user.set_password(data['password'])
    db.session.add(new_user)
    db.session.commit()
    return jsonify({'username': new_user.username, 'password': data['password']}), 201

@app.route('/api/users/<username>', methods=['DELETE'])
def delete_user(username):
    user = User.query.filter_by(username=username).first()
    if user:
        # TODO make admin deleteable only if there is no admin user
        # if user.role == 'admin':
        #     return jsonify({'error': 'Cannot delete admin user'}), 403   # keep the possibility to delete admin
        db.session.delete(user)
        db.session.commit()
        return jsonify({'message': 'User deleted successfully'}), 200
    return jsonify({'error': 'User not found'}), 404

@app.route('/api/users/<username>', methods=['PUT'])
def update_user(username):
    user = User.query.filter_by(username=username).first()
    data = request.json
    if user:
        user.personal_message = data.get('personal_message', user.personal_message)
        if 'password' in data:
            user.set_password(data['password'])
        db.session.commit()
        return jsonify({'message': 'User updated successfully'}), 200
    return jsonify({'error': 'User not found'}), 404

@app.route('/api/namesurnames', methods=['GET'])
def get_all_name_surnames():
    namesurnames = NameSurname.query.all()
    name_surname_list = [{'user_username': ns.user_username, 'name_surname': ns.name_surname} for ns in namesurnames]
    return jsonify(name_surname_list), 200


@app.route('/api/namesurnames', methods=['POST'])
def add_name_surname():
    data = request.json

    # Validate incoming data
    if not data or not data.get('user_username') or not data.get('name_surname'):
        return jsonify({'error': 'user_username and name_surname are required'}), 400

    user_username = data['user_username']
    name_surname = data['name_surname']

    # Check if the name_surname already exists for the given user_username
    existing_entry = NameSurname.query.filter_by(
        user_username=user_username,
        name_surname=name_surname
    ).first()

    if existing_entry:
        return jsonify({'error': 'Name and surname already exists for this user'}), 400

    # Create and add the new NameSurname entry
    new_name_surname = NameSurname(
        user_username=user_username,
        name_surname=name_surname
    )

    try:
        db.session.add(new_name_surname)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        # Log the error for debugging (optional)
        app.logger.error(f"Error adding NameSurname: {e}")
        return jsonify({'error': 'Database error: ' + str(e)}), 500

    return jsonify({
        'name_surname': new_name_surname.name_surname,
        'message': 'Name and surname added successfully'
    }), 201

@app.route('/api/namesurnames/<name_surname>', methods=['DELETE'])
def delete_name_surname(name_surname):
    # First delete all related form_response entries
    form_responses = FormResponse.query.filter_by(name_surname=name_surname).all()
    for response in form_responses:
        db.session.delete(response)

    # Now delete the name_surname entry
    name_surname_entry = NameSurname.query.filter_by(name_surname=name_surname).first()
    if name_surname_entry:
        db.session.delete(name_surname_entry)
        db.session.commit()
        return jsonify({'message': 'Name and surname deleted successfully'}), 200
    return jsonify({'error': 'Name and surname not found'}), 404


@app.route('/api/name_surnames/<user_username>', methods=['GET'])
def get_name_surnames(user_username):
    namesurnames = NameSurname.query.filter_by(user_username=user_username).all()
    name_surname_list = [{'name_surname': ns.name_surname} for ns in namesurnames]
    return jsonify(name_surname_list), 200

@app.route('/api/form_responses', methods=['GET'])
def get_all_form_responses():
    responses = FormResponse.query.all()
    response_list = [
        {
            'name_surname': r.name_surname,
            'user_username': r.user_username,
            'accepted': r.accepted,
            'menu_option': r.menu_option,
            'allergies': r.allergies,
            'comment': r.comment
        }
        for r in responses
    ]
    return jsonify(response_list), 200


@app.route('/api/form_responses', methods=['POST'])
def submit_form_response():
    data = request.json

    # Validation: If accepted is True, menu_option cannot be empty
    if data.get('accepted') and not data.get('menu_option'):
        return jsonify({'error': 'Menu option is required if the invitation is accepted.'}), 400


    existing_response = FormResponse.query.filter_by(name_surname=data['name_surname'],
                                                     user_username=data['user_username']).first()
    if existing_response:
        existing_response.accepted = data['accepted']
        existing_response.menu_option = data.get('menu_option', '')
        existing_response.allergies = data.get('allergies', '')
        existing_response.comment = data.get('comment', '')
    else:
        new_response = FormResponse(
            name_surname=data['name_surname'],
            user_username=data['user_username'],
            accepted=data['accepted'],
            menu_option=data.get('menu_option', ''),
            allergies=data.get('allergies', ''),
            comment=data.get('comment', '')
        )
        db.session.add(new_response)

    db.session.commit()
    return jsonify({'message': 'Form response submitted successfully'}), 201


@app.route('/api/form_responses/<user_username>', methods=['GET'])
def get_form_responses(user_username):
    responses = (
        db.session.query(FormResponse, NameSurname)
        .join(NameSurname, FormResponse.name_surname == NameSurname.name_surname)
        .filter(NameSurname.user_username == user_username)
        .all()
    )
    response_list = [
        {
            'name_surname': r.FormResponse.name_surname,
            'user_username': r.FormResponse.user_username,
            'accepted': r.FormResponse.accepted,
            'menu_option': r.FormResponse.menu_option,
            'allergies': r.FormResponse.allergies,
            'comment': r.FormResponse.comment
        }
        for r in responses
    ]
    return jsonify(response_list), 200

@app.route('/api/comments', methods=['GET'])
def get_all_comments():
    comments = GuestComment.query.all()
    comment_list = [{'user_username': c.user_username, 'comment': c.comment} for c in comments]
    return jsonify(comment_list), 200

@app.route('/api/comments', methods=['POST'])
def submit_comment():
    data = request.json
    new_comment = GuestComment(
        user_username=data['user_username'],
        comment=data['comment']
    )
    db.session.add(new_comment)
    db.session.commit()
    return jsonify({'message': 'Comment submitted successfully'}), 201

@app.route('/api/comments/<user_username>', methods=['GET'])
def get_user_comments(user_username):
    comments = GuestComment.query.filter_by(user_username=user_username).all()
    comment_list = [{'user_username': c.user_username, 'comment': c.comment} for c in comments]
    return jsonify(comment_list), 200

@app.route('/check-db-health', methods=['GET'])
def db_health():
    try:
        responses = FormResponse.query.all()
        # db.execute('SELECT 1')  # Simple query to test the database connection
        # db.close()  # Always close the connection
        return "Database is alive", 200
    except Exception as e:
        return f"Error: {e}", 500

if __name__ == '__main__':
    app.run(debug=True)