import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Button from './Button'
import Field from './Field'
import Icon from './Icon'
import { login } from '../features/auth/authSlice'

function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const dispatch = useDispatch()
  const { status, error } = useSelector((state) => state.auth)
  const isSubmitting = status === 'loading'

  const submit = (event) => {
    event.preventDefault()
    dispatch(login({ email, password }))
  }

  return (
    <main className="login-page">
      <div className="login-decoration decoration-one" /><div className="login-decoration decoration-two" />
      <section className="login-card">
        <a className="brand login-brand" href="#"><span className="brand-mark"><Icon name="grid" /></span><span>PROMOTION KART<span className="brand-period">.</span></span></a>
        <div className="login-heading"><span className="login-kicker">WELCOME BACK</span><h1>Sign in to your workspace</h1><p>Enter your details to continue to your dashboard.</p></div>
        <form className="login-form" onSubmit={submit}>
          <Field label="Email address" id="login-email" type="email" placeholder="you@company.com" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} />
          <Field label="Password" id="login-password" type="password" placeholder="Enter your password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} />
          {error && <p className="form-error" role="alert">{error}</p>}
          <Button type="submit" className="login-submit" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in…' : 'Sign in'} <span aria-hidden="true">→</span>
          </Button>
        </form>
        <p className="login-footnote">PROMOTION KART <span>·</span> Sign in with your workspace account</p>
      </section>
    </main>
  )
}

export default LoginPage
