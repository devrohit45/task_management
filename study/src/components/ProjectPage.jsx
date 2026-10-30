import Button from './Button'
import Icon from './Icon'

const projectStatuses = ['All', 'Pending', 'In progress', 'Completed', 'On hold']

function ProjectPage({ projects, statusFilter, onFilter, canManageProjects, onCreate, onEdit, onDelete, onViewTasks }) {
  const visibleProjects = projects.filter((project) => statusFilter === 'All' || project.status === statusFilter)

  return (
    <section className="projects-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">{canManageProjects ? 'WORKSPACE' : 'YOUR WORK'}</p>
          <h1>Projects</h1>
          <p className="page-subtitle">{canManageProjects ? 'Organize team tasks into projects and track progress.' : 'Projects assigned to you and their current progress.'}</p>
        </div>
        {canManageProjects && <Button onClick={onCreate}><Icon name="plus" /> New project</Button>}
      </div>

      <div className="project-toolbar">
        <span>{projects.length} {projects.length === 1 ? 'project' : 'projects'}</span>
        <label className="filter-field">
          <span>Status</span>
          <select value={statusFilter} onChange={(event) => onFilter(event.target.value)} aria-label="Filter projects by status">
            {projectStatuses.map((status) => <option key={status}>{status}</option>)}
          </select>
        </label>
      </div>

      {visibleProjects.length > 0 ? (
        <div className="project-grid">
          {visibleProjects.map((project) => (
            <article className="project-card" key={project.id}>
              <div className="project-card-top">
                <span className="project-card-icon"><Icon name="grid" /></span>
                <span className={`project-status project-status-${project.status.toLowerCase().replaceAll(' ', '-')}`}>{project.status}</span>
              </div>
              <h2>{project.name}</h2>
              <p className="project-description">{project.description || 'No project description.'}</p>
              <div className="project-meta">
                <span><Icon name="users" /> {project.assignee}</span>
                {project.dueDate && <span><Icon name="calendar" /> Due {new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(`${project.dueDate}T00:00:00`))}</span>}
              </div>
              <div className="project-card-footer">
                <span><strong>{project.taskCount}</strong> {project.taskCount === 1 ? 'task' : 'tasks'}</span>
                <div className="project-card-actions">
                  <button className="project-view-link" onClick={() => onViewTasks(project)}>View tasks <span aria-hidden="true">→</span></button>
                  {canManageProjects && <div className="row-actions">
                    <button className="icon-button" aria-label={`Edit ${project.name}`} title="Edit project" onClick={() => onEdit(project)}><Icon name="edit" size={16} /></button>
                    <button className="icon-button delete-action" aria-label={`Delete ${project.name}`} title="Delete project" onClick={() => onDelete(project)}><Icon name="trash" size={16} /></button>
                  </div>}
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="project-empty">
          <span className="empty-icon"><Icon name="grid" size={21} /></span>
          <strong>No projects found</strong>
          <span>{statusFilter === 'All' ? 'Create a project to organize tasks by team and goal.' : `There are no ${statusFilter.toLowerCase()} projects.`}</span>
        </div>
      )}
    </section>
  )
}

export default ProjectPage
