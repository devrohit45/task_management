import Button from './Button'
import Icon from './Icon'

function initials(name) {
  return name.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase()
}

function TaskTable({ tasks, projects, projectFilter, onProjectFilter, search, onSearch, statusFilter, onFilter, onEdit, onDelete, canManageTask }) {
  return (
    <div className="table-card">
      <div className="table-card-header">
        <div><h2>All tasks <span className="count-pill">{tasks.length}</span></h2><p>Keep track of work across your team and projects.</p></div>
        <span className="task-board-label"><Icon name="checklist" size={15} /> List view</span>
      </div>
      <div className="table-toolbar">
        <label className="search-field"><Icon name="search" /><input value={search} onChange={(event) => onSearch(event.target.value)} placeholder="Search tasks, projects, or assignees" aria-label="Search tasks, projects, or assignees" /></label>
        <label className="filter-field"><span>Status</span><select value={statusFilter} onChange={(event) => onFilter(event.target.value)} aria-label="Filter tasks by status"><option>All</option><option>To do</option><option>In progress</option><option>In review</option><option>Done</option></select></label>
        <label className="filter-field"><span>Project</span><select value={projectFilter} onChange={(event) => onProjectFilter(event.target.value)} aria-label="Filter tasks by project"><option value="All">All projects</option>{projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</select></label>
      </div>
      <div className="table-scroll">
        <table className="tasks-table">
          <thead><tr><th>Task</th><th>Project</th><th>Status</th><th>Priority</th><th>Assignee</th><th>Due date</th><th><span className="sr-only">Actions</span></th></tr></thead>
          <tbody>
            {tasks.map((task, index) => (
              <tr key={task.id}>
                <td><div className="task-cell"><span className={`task-check task-check-${task.status.toLowerCase().replaceAll(' ', '-')}`}>{task.status === 'Done' ? '✓' : ''}</span><span className="task-identity"><strong>{task.title}</strong><small>{task.description || 'No description'}</small></span></div></td>
                <td><span className="task-project-name">{task.projectName || 'No project'}</span></td>
                <td><span className={`status-badge task-status status-${task.status.toLowerCase().replaceAll(' ', '-')}`}><i />{task.status}</span></td>
                <td><span className={`priority-label priority-${task.priority.toLowerCase()}`}><i />{task.priority}</span></td>
                <td><div className="assignee-cell"><span className={`user-avatar avatar-${index % 6}`}>{initials(task.assignee)}</span><span>{task.assignee}</span></div></td>
                <td className="date-cell">{new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(`${task.dueDate}T00:00:00`))}</td>
                <td><div className="row-actions">{canManageTask(task) && <><button className="icon-button" aria-label={`Edit ${task.title}`} title="Edit task" onClick={() => onEdit(task)}><Icon name="edit" size={16} /></button><button className="icon-button delete-action" aria-label={`Delete ${task.title}`} title="Delete task" onClick={() => onDelete(task)}><Icon name="trash" size={16} /></button></>}</div></td>
              </tr>
            ))}
            {tasks.length === 0 && <tr><td className="empty-state" colSpan="7"><span className="empty-icon"><Icon name="search" size={21} /></span><strong>No tasks found</strong><span>Try a different search or status filter.</span></td></tr>}
          </tbody>
        </table>
      </div>
      <div className="table-footer"><span>Showing <strong>{tasks.length}</strong> {tasks.length === 1 ? 'task' : 'tasks'}</span><div className="pagination"><Button variant="secondary" disabled>Previous</Button><span>Page 1 of 1</span><Button variant="secondary" disabled>Next</Button></div></div>
    </div>
  )
}

export default TaskTable
