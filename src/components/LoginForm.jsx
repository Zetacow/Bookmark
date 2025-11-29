import { useState } from 'react'
import PropTypes from 'prop-types'
import GoogleLoginButton from './GoogleLoginButton'

const initialState = {
  username: '',
  password: '',
}

function LoginForm({ onLogin, onGoogleCredential, onAuthError, error, googleEnabled }) {
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

        {googleEnabled ? (
          <div className="federated-section">
            <div className="divider">
              <span>or continue with</span>
            </div>
            {onGoogleCredential ? (
              <GoogleLoginButton
                onCredential={onGoogleCredential}
                onError={(message) => onAuthError?.(message)}
              />
            ) : (
              <p className="hint">Google Sign-In is unavailable in this build.</p>
            )}
          </div>
        ) : (
          <p className="hint">Google Sign-In is disabled (no client ID configured).</p>
        )}

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
  onGoogleCredential: PropTypes.func,
  onAuthError: PropTypes.func,
  error: PropTypes.string,
  googleEnabled: PropTypes.bool,
}

export default LoginForm
