import { useState } from 'react'
import Button from './Button'
import Field from './Field'
import Icon from './Icon'

function TaskForm({ task, onCancel, onSubmit }) {
  const [values, setValues] = useState({
    title: task?.title ?? '',
    description: task?.description ?? '',
    assignee: task?.assignee ?? '',
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
        <Field label="Assignee" id="task-assignee" name="assignee" placeholder="e.g. Alex Morgan" required value={values.assignee} onChange={update} />
        <Field label="Due date" id="task-due-date" name="dueDate" type="date" required value={values.dueDate} onChange={update} />
      </div>
      <div className="form-row">
        <div className="form-field"><label htmlFor="task-status">Status</label><select id="task-status" name="status" value={values.status} onChange={update}><option>To do</option><option>In progress</option><option>In review</option><option>Done</option></select></div>
        <div className="form-field"><label htmlFor="task-priority">Priority</label><select id="task-priority" name="priority" value={values.priority} onChange={update}><option>Low</option><option>Medium</option><option>High</option></select></div>
      </div>
      <p className="form-note"><Icon name="checklist" size={14} /> Tasks are saved in this browser.</p>
      <footer className="form-actions"><Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button><Button type="submit">{task ? 'Save changes' : 'Create task'}</Button></footer>
    </form>
  )
}

export default TaskForm
