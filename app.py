from flask import Flask, render_template, jsonify, request, redirect, url_for, session, flash
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from dotenv import load_dotenv
import json
import os

# Load environment variables
load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv('SECRET_KEY')

# --- DATABASE CONFIGURATION (NEON) ---
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# --- USER MODEL ---
class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)
    role = db.Column(db.String(20), nullable=False) # 'manager' or 'analyst'

# Create tables once on startup
with app.app_context():
    db.create_all()

# --- AUTH ROUTES ---

@app.route('/')
def index():
    if 'user_id' in session:
        return redirect(url_for('dashboard'))
    return redirect(url_for('login'))

@app.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        role = request.form.get('role')

        # Check if user exists
        if User.query.filter_by(username=username).first():
            flash('Username already exists. Please login.', 'error')
            return redirect(url_for('signup'))

        # Create new user
        hashed_pw = generate_password_hash(password)
        new_user = User(username=username, password_hash=hashed_pw, role=role)
        
        try:
            db.session.add(new_user)
            db.session.commit()
            flash('Account created! Please login.', 'success')
            return redirect(url_for('login'))
        except:
            flash('Error creating account.', 'error')

    return render_template('signup.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')

        user = User.query.filter_by(username=username).first()

        if user and check_password_hash(user.password_hash, password):
            session['user_id'] = user.id
            session['username'] = user.username
            session['role'] = user.role
            return redirect(url_for('dashboard'))
        else:
            flash('Invalid username or password.', 'error')

    return render_template('login.html')

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('login'))

# --- DASHBOARD ROUTES (PROTECTED) ---

@app.route('/dashboard')
def dashboard():
    if 'user_id' not in session:
        flash('Please login to access the dashboard.', 'warning')
        return redirect(url_for('login'))
    
    return render_template('dashboard.html', user=session['username'], role=session['role'])

@app.route('/api/data')
def get_data():
    if 'user_id' not in session:
        return jsonify({"error": "Unauthorized"}), 401
        
    try:
        with open('dashboard_data.json', 'r') as f:
            data = json.load(f)
        return jsonify(data)
    except FileNotFoundError:
        return jsonify({"error": "Data file not found"}), 404

if __name__ == '__main__':
    app.run(debug=True, port=5000)