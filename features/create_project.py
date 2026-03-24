from flask import Blueprint, render_template, request, redirect, url_for, flash
from models import db, Project

create_project_bp = Blueprint('create_project', __name__, template_folder='.')

@create_project_bp.route('/create-project', methods=['GET', 'POST'])
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
    
    projects = Project.query.all()
    return render_template('create_project.html', projects=projects)

@create_project_bp.route('/delete-project/<int:project_id>', methods=['POST'])
def delete_project(project_id):
    project = Project.query.get_or_404(project_id)
    if project.pcbs:
        flash(f'Cannot delete project "{project.name}" because it has logged PCBs.', 'warning')
    else:
        db.session.delete(project)
        db.session.commit()
        flash(f'Project "{project.name}" deleted successfully.', 'success')
    
    # Redirect back to where the user came from
    return redirect(request.referrer or url_for('home'))
