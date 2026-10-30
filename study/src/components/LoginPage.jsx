import { useState } from 'react'
import Button from './Button'
import Field from './Field'
import Icon from './Icon'

const demoAccounts = [
  { name: 'Jordan Davis', role: 'Admin', email: 'admin@taskflow.io', password: 'admin123', initials: 'JD', avatar: 'account-purple' },
  { name: 'Olivia Rhye', role: 'Editor', email: 'olivia@taskflow.io', password: 'team123', initials: 'OR', avatar: 'account-peach' },
  { name: 'Phoenix Baker', role: 'Member', email: 'phoenix@taskflow.io', password: 'team123', initials: 'PB', avatar: 'account-blue' },
]

function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const submit = (event) => {
    event.preventDefault()
    const account = demoAccounts.find((demoAccount) => (
      demoAccount.email === email.trim().toLowerCase() && demoAccount.password === password
    ))
    if (!account) {
      setError('Those sign-in details don’t match one of the demo accounts.')
      return
    }
    onLogin(account)
  }

  return (
    <main className="login-page">
      <div className="login-decoration decoration-one" /><div className="login-decoration decoration-two" />
      <section className="login-card">
        <a className="brand login-brand" href="#"><span className="brand-mark"><Icon name="grid" /></span><span>taskflow<span className="brand-period">.</span></span></a>
        <div className="login-heading"><span className="login-kicker">WELCOME BACK</span><h1>Sign in to your workspace</h1><p>Enter your details to continue to your dashboard.</p></div>
        <form className="login-form" onSubmit={submit}>
          <Field label="Email address" id="login-email" type="email" placeholder="you@company.com" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} />
          <Field label="Password" id="login-password" type="password" placeholder="Enter your password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} />
          {error && <p className="form-error" role="alert">{error}</p>}
          <Button type="submit" className="login-submit">Sign in <span aria-hidden="true">→</span></Button>
        </form>
        <div className="demo-accounts">
          <div className="demo-accounts-heading"><strong>Try a demo account</strong><span>Choose an account to fill in its login.</span></div>
          {demoAccounts.map((account) => (
            <button
              className={`demo-account ${email === account.email ? 'is-selected' : ''}`}
              key={account.email}
              type="button"
              onClick={() => { setEmail(account.email); setPassword(account.password); setError('') }}
            >
              <span className={`demo-account-avatar ${account.avatar}`}>{account.initials}</span>
              <span className="demo-account-info"><strong>{account.name}</strong><small>{account.role} · {account.email}</small></span>
              <span className="demo-account-arrow" aria-hidden="true">→</span>
            </button>
          ))}
          <span className="demo-password-hint">Team account password: <strong>team123</strong></span>
        </div>
        <p className="login-footnote">Taskflow <span>·</span> A frontend demo workspace</p>
      </section>
    </main>
  )
}

export default LoginPage
