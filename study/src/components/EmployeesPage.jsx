import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Button from './Button'
import Field from './Field'
import Icon from './Icon'
import { createEmployee, updateEmployee } from '../features/tasks/tasksSlice'
import roleLabel from '../utils/roleLabel'

function initials(name) {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0].toUpperCase()).join('')
}

function EmployeesPage({ onCreated }) {
  const dispatch = useDispatch()
  const { users, mutationStatus } = useSelector((state) => state.tasks)
  const teamMembers = users.filter((user) => user.role !== 'admin')
  const [values, setValues] = useState({ name: '', email: '', password: '', role: 'employee' })
  const [editingMember, setEditingMember] = useState(null)
  const [success, setSuccess] = useState('')
  const isSaving = mutationStatus === 'loading'

  const update = (event) => {
    setValues((current) => ({ ...current, [event.target.name]: event.target.value }))
    setSuccess('')
  }

  const submit = async (event) => {
    event.preventDefault()
    try {
      const employee = editingMember
        ? await dispatch(updateEmployee({ id: editingMember.id, values })).unwrap()
        : await dispatch(createEmployee(values)).unwrap()
      setValues({ name: '', email: '', password: '', role: 'employee' })
      setEditingMember(null)
      setSuccess(editingMember
        ? `${employee.name}'s account has been updated.`
        : `${employee.name} has been added as ${roleLabel(employee.role)}.`)
      if (!editingMember) onCreated(employee)
    } catch {
      setSuccess('')
    }
  }

  const startEditing = (member) => {
    setEditingMember(member)
    setValues({ name: member.name, email: member.email, password: '', role: member.role })
    setSuccess('')
  }

  const cancelEditing = () => {
    setEditingMember(null)
    setValues({ name: '', email: '', password: '', role: 'employee' })
    setSuccess('')
  }

  return (
    <section className="employees-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">ADMINISTRATION</p>
          <h1>Team members</h1>
          <p className="page-subtitle">Create accounts, choose a role, and manage your team roster.</p>
        </div>
      </div>

      <div className="employees-layout">
        <form className="employee-form panel" onSubmit={submit}>
          <div className="panel-heading">
            <div><h2>{editingMember ? 'Update team member' : 'Add a team member'}</h2><p>Choose whether this person is a manager or employee.</p></div>
            <span className="employee-form-icon"><Icon name="users" /></span>
          </div>
          <Field label="Full name" id="employee-name" name="name" autoComplete="name" placeholder="e.g. Alex Morgan" required maxLength={255} value={values.name} onChange={update} />
          <Field label="Email address" id="employee-email" name="email" type="email" autoComplete="email" placeholder="alex@company.com" required maxLength={255} value={values.email} onChange={update} />
          <div className="form-field">
            <label htmlFor="employee-role">Role</label>
            <select id="employee-role" name="role" value={values.role} onChange={update}>
              <option value="employee">Employee</option>
              <option value="manager">Manager</option>
            </select>
            <span className="field-hint">Admin access can only be granted by an existing system administrator.</span>
          </div>
          {!editingMember && <Field label="Temporary password" id="employee-password" name="password" type="password" autoComplete="new-password" placeholder="At least 8 characters" required minLength={8} maxLength={255} value={values.password} onChange={update} />}
          {!editingMember && <p className="form-note"><Icon name="checklist" size={14} /> Share the temporary password securely with the new employee.</p>}
          {success && <p className="profile-success" role="status">{success}</p>}
          <div className="form-actions">
            {editingMember && <Button type="button" variant="secondary" onClick={cancelEditing}>Cancel</Button>}
            <Button type="submit" disabled={isSaving}><Icon name={editingMember ? 'edit' : 'plus'} /> {isSaving ? 'Saving…' : editingMember ? 'Save changes' : 'Add team member'}</Button>
          </div>
        </form>

        <section className="employees-roster">
          <div className="table-card-header employee-roster-heading">
            <div><h2>Team roster <span className="count-pill">{teamMembers.length}</span></h2><p>Active managers and employees.</p></div>
          </div>
          {teamMembers.length > 0 ? (
            <div className="employee-list">
              {teamMembers.map((employee) => (
                <article className="employee-row" key={employee.id}>
                  <span className="profile-avatar">{initials(employee.name)}</span>
                  <span className="employee-info"><strong>{employee.name}</strong><small>{employee.email}</small></span>
                  <span className="employee-role">{roleLabel(employee.role)}</span>
                  <button className="icon-button" aria-label={`Edit ${employee.name}`} title="Edit team member" onClick={() => startEditing(employee)}><Icon name="edit" size={16} /></button>
                </article>
              ))}
            </div>
          ) : (
            <div className="project-empty employee-empty">
              <span className="empty-icon"><Icon name="users" size={21} /></span>
              <strong>No employees yet</strong>
              <span>Add a team member account to get your team started.</span>
            </div>
          )}
        </section>
      </div>
    </section>
  )
}

export default EmployeesPage
