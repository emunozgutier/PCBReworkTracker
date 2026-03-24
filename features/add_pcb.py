from flask import Blueprint, render_template, request, redirect, url_for, flash
from models import db, Project, PCB

add_pcb_bp = Blueprint('add_pcb', __name__, template_folder='.')

@add_pcb_bp.route('/add-pcb', methods=['GET', 'POST'])
def add_pcb():
    projects = Project.query.all()
    if not projects:
        flash('Create a project first!', 'warning')
        return redirect(url_for('create_project.create_project'))
        
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
