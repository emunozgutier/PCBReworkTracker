from flask import Flask, render_template, request, redirect, url_for, flash
from flask_sqlalchemy import SQLAlchemy
import os

app = Flask(__name__)
app.secret_key = 'super-secret-key'

# Database Configuration
basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'pcb_tracker.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Database Models
class Project(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    pcbs = db.relationship('PCB', backref='project', lazy=True)

class PCB(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    number = db.Column(db.String(100), nullable=False)
    project_id = db.Column(db.Integer, db.ForeignKey('project.id'), nullable=False)

@app.route('/')
def home():
    projects = Project.query.all()
    pcbs = PCB.query.all()
    return render_template('index.html', projects=projects, pcbs=pcbs)

@app.route('/create-project', methods=['GET', 'POST'])
def create_project():
    if request.method == 'POST':
        project_name = request.form.get('project_name')
        if project_name:
            if Project.query.filter_by(name=project_name).first():
                flash(f'Project "{project_name}" already exists.', 'error')
            else:
                new_project = Project(name=project_name)
                db.session.add(new_project)
                db.session.commit()
                flash(f'Project "{project_name}" created successfully!', 'success')
                return redirect(url_for('home'))
        else:
            flash('Project name is required.', 'error')
    return render_template('create_project.html')

@app.route('/add-pcb', methods=['GET', 'POST'])
def add_pcb():
    projects = Project.query.all()
    if not projects:
        flash('Create a project first!', 'warning')
        return redirect(url_for('create_project'))
        
    if request.method == 'POST':
        project_name = request.form.get('project_name')
        pcb_number = request.form.get('pcb_number')
        
        project = Project.query.filter_by(name=project_name).first()
        if project and pcb_number:
            new_pcb = PCB(number=pcb_number, project=project)
            db.session.add(new_pcb)
            db.session.commit()
            flash(f'PCB "{pcb_number}" added to project "{project_name}"!', 'success')
            return redirect(url_for('home'))
        else:
            flash('Both project and PCB number are required.', 'error')
            
    return render_template('add_pcb.html', projects=projects)

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
