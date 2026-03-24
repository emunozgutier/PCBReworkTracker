from flask import Flask, render_template, request, redirect, url_for, flash, jsonify
from models import db, Project, PCB, Rework, TaskTag
from pages.create_project import create_project_bp
from pages.add_pcb import add_pcb_bp
import os

app = Flask(__name__, template_folder='pages')
app.secret_key = 'super-secret-key'

# Database Configuration
basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'pcb_tracker.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

# Register Blueprints
app.register_blueprint(create_project_bp)
app.register_blueprint(add_pcb_bp)

with app.app_context():
    db.create_all()
    # Basic Seeding for demonstration if empty
    if not TaskTag.query.first():
        tags = ['Component Swap', 'Trace Repair', 'Cleaning', 'Firmware Update', 'Testing']
        for tag_name in tags:
            db.session.add(TaskTag(name=tag_name))
        db.session.commit()
    
    if not Rework.query.first():
        # Add a sample rework if a PCB exists
        sample_pcb = PCB.query.first()
        if sample_pcb:
            db.session.add(Rework(description='Initial component inspection and flux removal.', pcb_id=sample_pcb.id))
            db.session.commit()

@app.route('/api/dashboard')
def dashboard_api():
    projects = Project.query.all()
    pcbs = PCB.query.order_by(PCB.id.desc()).all()
    reworks = Rework.query.order_by(Rework.id.desc()).all()
    task_tags = TaskTag.query.all()
    
    return jsonify({
        'projects': [{'id': p.id, 'name': p.name, 'pcb_count': len(p.pcbs)} for p in projects],
        'pcbs': [{'id': p.id, 'number': p.number, 'project_name': p.project.name} for p in pcbs],
        'reworks': [{
            'id': r.id, 
            'description': r.description, 
            'pcb_number': r.pcb.number, 
            'timestamp': r.timestamp.strftime('%Y-%m-%d')
        } for r in reworks],
        'task_tags': [{'id': t.id, 'name': t.name} for t in task_tags]
    })

@app.route('/')
def home():
    projects = Project.query.all()
    pcbs = PCB.query.order_by(PCB.id.desc()).all()
    reworks = Rework.query.order_by(Rework.id.desc()).all()
    task_tags = TaskTag.query.all()
    
    return render_template('main_page.html', 
                           projects=projects, 
                           pcbs=pcbs, 
                           reworks=reworks, 
                           task_tags=task_tags)

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
