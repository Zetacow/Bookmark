import { useState } from 'react'
import PropTypes from 'prop-types'

const initialState = {
  username: '',
  password: '',
}

function LoginForm({ onLogin, error }) {
  const [formData, setFormData] = useState(initialState)

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    onLogin(formData)
  }

  return (
    <section className="login-shell">
      <div className="login-card">
        <header>
          <p className="eyebrow">Bookmark</p>
          <h1>Welcome back</h1>
          <p className="subtitle">
            Sign in with the demo credentials to see and manage your manga vault.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="login-form">
          <label>
            <span>Username</span>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="otaku"
              autoComplete="username"
              required
            />
          </label>
          <label>
            <span>Password</span>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </label>
          {error && <p className="form-error">{error}</p>}
          <button type="submit" className="primary">Login</button>
        </form>

        <footer>
          <p className="hint">
            Demo account: <strong>otaku / manga123</strong>
          </p>
        </footer>
      </div>
    </section>
  )
}

LoginForm.propTypes = {
  onLogin: PropTypes.func.isRequired,
  error: PropTypes.string,
}

export default LoginForm
