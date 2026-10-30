import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Button from './Button'
import Field from './Field'
import { updateProfile } from '../features/auth/authSlice'
import roleLabel from '../utils/roleLabel'

function ProfilePage({ onCancel }) {
  const dispatch = useDispatch()
  const { account, profileStatus, profileError } = useSelector((state) => state.auth)
  const [name, setName] = useState(account.name)
  const [email, setEmail] = useState(account.email)
  const isSaving = profileStatus === 'loading'

  const submit = (event) => {
    event.preventDefault()
    dispatch(updateProfile({ name, email }))
  }

  return (
    <section className="profile-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">ACCOUNT SETTINGS</p>
          <h1>Profile</h1>
          <p className="page-subtitle">Manage the personal details for your account.</p>
        </div>
      </div>

      <div className="profile-card">
        <div className="profile-card-heading">
          <span className="profile-card-avatar">{account.initials}</span>
          <div>
            <h2>{account.name}</h2>
            <p>{roleLabel(account.role)} account</p>
          </div>
        </div>

        <form className="profile-form" onSubmit={submit}>
          <div className="profile-form-heading">
            <h2>Personal information</h2>
            <p>Update your name and email address.</p>
          </div>
          <Field
            label="Full name"
            id="profile-name"
            type="text"
            autoComplete="name"
            required
            maxLength={255}
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <Field
            label="Email address"
            id="profile-email"
            type="email"
            autoComplete="email"
            required
            maxLength={255}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <div className="form-field">
            <label htmlFor="profile-role">Workspace role</label>
            <input id="profile-role" type="text" value={roleLabel(account.role)} readOnly />
            <span className="field-hint">Contact your administrator to change your role.</span>
          </div>
          {profileError && <p className="form-error" role="alert">{profileError}</p>}
          {profileStatus === 'succeeded' && <p className="profile-success" role="status">Your profile has been updated.</p>}
          <div className="profile-form-actions">
            <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Saving…' : 'Save changes'}
            </Button>
          </div>
        </form>
      </div>
    </section>
  )
}

export default ProfilePage
