import PropTypes from 'prop-types'
import { GoogleLogin } from '@react-oauth/google'

function GoogleLoginButton({ onCredential, onError }) {
  return (
    <div className="federated-login">
      <GoogleLogin
        text="continue_with"
        width="100%"
        shape="pill"
        onSuccess={(response) => {
          if (response?.credential) {
            onCredential(response.credential)
          } else {
            onError?.('Google response did not include a credential. Please try again.')
          }
        }}
        onError={() => onError?.('Google sign-in was cancelled or failed.')}
      />
    </div>
  )
}

GoogleLoginButton.propTypes = {
  onCredential: PropTypes.func.isRequired,
  onError: PropTypes.func,
}

export default GoogleLoginButton
