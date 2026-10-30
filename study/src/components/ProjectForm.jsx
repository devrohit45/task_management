import { useState } from 'react'
import Button from './Button'
import Field from './Field'
import roleLabel from '../utils/roleLabel'

const projectStatuses = ['Pending', 'In progress', 'Completed', 'On hold']

function ProjectForm({ project, users, isSaving, onCancel, onSubmit }) {
  const [values, setValues] = useState({
    name: project?.name ?? '',
    description: project?.description ?? '',
    status: project?.status ?? 'Pending',
    dueDate: project?.dueDate ?? '',
    assignedToId: project?.assignedToId?.toString() ?? '',
  })
  const assignableUsers = users.filter((user) => ['manager', 'employee'].includes(user.role))

  const update = (event) => setValues((current) => ({ ...current, [event.target.name]: event.target.value }))

  return (
    <form className="task-form" onSubmit={(event) => { event.preventDefault(); onSubmit(values) }}>
      <Field label="Project name" id="project-name" name="name" placeholder="e.g. Website redesign" required maxLength={255} value={values.name} onChange={update} />
      <div className="form-field">
        <label htmlFor="project-description">Description <span className="optional-label">Optional</span></label>
        <textarea id="project-description" name="description" rows="3" placeholder="What is this project about?" value={values.description} onChange={update} />
      </div>
      <div className="form-row">
        <div className="form-field">
          <label htmlFor="project-assignee">Assign project to</label>
          <select id="project-assignee" name="assignedToId" required value={values.assignedToId} onChange={update}>
            <option value="" disabled>Select a manager or employee</option>
            {assignableUsers.map((user) => <option key={user.id} value={user.id}>{user.name} · {roleLabel(user.role)}</option>)}
          </select>
        </div>
        <Field label="Due date" id="project-due-date" name="dueDate" type="date" value={values.dueDate} onChange={update} />
      </div>
      <div className="form-field">
        <label htmlFor="project-status">Project status</label>
        <select id="project-status" name="status" value={values.status} onChange={update}>
          {projectStatuses.map((status) => <option key={status}>{status}</option>)}
        </select>
      </div>
      <footer className="form-actions">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={isSaving || assignableUsers.length === 0}>{isSaving ? 'Saving…' : project ? 'Save changes' : 'Create project'}</Button>
      </footer>
    </form>
  )
}

export default ProjectForm
