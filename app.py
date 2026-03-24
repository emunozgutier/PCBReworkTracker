from flask import Flask, render_template, request, redirect, url_for, flash

app = Flask(__name__)
app.secret_key = 'super-secret-key' # Needed for flash messages

# In-memory storage
projects = []
pcbs = []

@app.route('/')
def home():
    return render_template('index.html', projects=projects, pcbs=pcbs)

@app.route('/create-project', methods=['GET', 'POST'])
def create_project():
    if request.method == 'POST':
        project_name = request.form.get('project_name')
        if project_name and project_name not in projects:
            projects.append(project_name)
            flash(f'Project "{project_name}" created successfully!', 'success')
            return redirect(url_for('home'))
        elif project_name in projects:
            flash(f'Project "{project_name}" already exists.', 'error')
    return render_template('create_project.html')

@app.route('/add-pcb', methods=['GET', 'POST'])
def add_pcb():
    if not projects:
        flash('Create a project first!', 'warning')
        return redirect(url_for('create_project'))
        
    if request.method == 'POST':
        project_name = request.form.get('project_name')
        pcb_number = request.form.get('pcb_number')
        if project_name and pcb_number:
            pcbs.append({'project': project_name, 'number': pcb_number})
            flash(f'PCB "{pcb_number}" added to project "{project_name}"!', 'success')
            return redirect(url_for('home'))
        else:
            flash('Both project and PCB number are required.', 'error')
            
    return render_template('add_pcb.html', projects=projects)

if __name__ == '__main__':
    app.run(debug=True)
