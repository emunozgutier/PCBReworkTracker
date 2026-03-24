from flask import Flask, render_template
from models import db, Project, PCB, Rework, TaskTag
from features.create_project import create_project_bp
from features.add_pcb import add_pcb_bp
import os

app = Flask(__name__)
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

@app.route('/')
def home():
    projects = Project.query.all()
    pcbs = PCB.query.order_by(PCB.id.desc()).all()
    reworks = Rework.query.order_by(Rework.id.desc()).all()
    task_tags = TaskTag.query.all()
    
    return render_template('index.html', 
                           projects=projects, 
                           pcbs=pcbs, 
                           reworks=reworks, 
                           task_tags=task_tags)

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
