import { useState } from 'react'
import Button from './Button'
import Field from './Field'
import Icon from './Icon'

function TaskForm({ task, users, projects, accountId, role, isSaving, onCancel, onSubmit }) {
  const canAssignTeam = ['admin', 'manager'].includes(role)
  const [values, setValues] = useState({
    title: task?.title ?? '',
    description: task?.description ?? '',
    projectId: task?.projectId?.toString() ?? projects[0]?.id?.toString() ?? '',
    assigneeId: canAssignTeam
      ? task?.assigneeId?.toString() ?? accountId?.toString() ?? ''
      : accountId.toString(),
    status: task?.status ?? 'To do',
    priority: task?.priority ?? 'Medium',
    dueDate: task?.dueDate ?? '',
  })

  const update = (event) => setValues((current) => ({ ...current, [event.target.name]: event.target.value }))

  return (
    <form className="task-form" onSubmit={(event) => { event.preventDefault(); onSubmit(values) }}>
      <Field label="Task name" id="task-title" name="title" placeholder="e.g. Prepare product launch" required value={values.title} onChange={update} />
      <div className="form-field"><label htmlFor="task-description">Description <span className="optional-label">Optional</span></label><textarea id="task-description" name="description" rows="3" placeholder="Add context or details for this task..." value={values.description} onChange={update} /></div>
      <div className="form-row">
        <div className="form-field">
          <label htmlFor="task-project">Project <span className="optional-label">Optional</span></label>
          <select id="task-project" name="projectId" value={values.projectId} onChange={update}>
            <option value="">Personal task (no project)</option>
            {projects.map((project) => <option key={project.id} value={project.id}>{project.name} · {project.status}</option>)}
          </select>
        </div>
        <div className="form-field">
          <label htmlFor="task-assignee">Assignee</label>
          <select id="task-assignee" name="assigneeId" required value={values.assigneeId} disabled={!canAssignTeam} onChange={update}>
            {users.map((user) => <option key={user.id} value={user.id}>{user.name} · {user.role}</option>)}
          </select>
        </div>
      </div>
      <div className="form-row">
        <div className="form-field"><label htmlFor="task-status">Status</label><select id="task-status" name="status" value={values.status} onChange={update}><option>To do</option><option>In progress</option><option>In review</option><option>Done</option></select></div>
        <div className="form-field"><label htmlFor="task-priority">Priority</label><select id="task-priority" name="priority" value={values.priority} onChange={update}><option>Low</option><option>Medium</option><option>High</option></select></div>
      </div>
      <Field label="Due date" id="task-due-date" name="dueDate" type="date" required value={values.dueDate} onChange={update} />
      <p className="form-note"><Icon name="checklist" size={14} /> {canAssignTeam ? 'Choose a project and assignee, or leave this as a personal task.' : 'This task will be assigned to your account. Choose one of your assigned projects or leave it personal.'}</p>
      <footer className="form-actions"><Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button><Button type="submit" disabled={isSaving}>{isSaving ? 'Saving…' : task ? 'Save changes' : 'Create task'}</Button></footer>
    </form>
  )
}

export default TaskForm
