from flask import Flask, render_template
from models import db, Project, PCB
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

@app.route('/')
def home():
    projects = Project.query.all()
    pcbs = PCB.query.all()
    return render_template('index.html', projects=projects, pcbs=pcbs)

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
