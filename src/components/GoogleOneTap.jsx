import { useGoogleOneTapLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';

export default function GoogleOneTap() {
  const { isAuthenticated, oneTapLogin } = useAuth();

  useGoogleOneTapLogin({
    onSuccess: async (credentialResponse) => {
      try {
        await oneTapLogin(credentialResponse.credential);
      } catch {
        // silent — user can still log in manually
      }
    },
    onError: () => {},
    cancel_on_tap_outside: false,
    disabled: isAuthenticated,
  });

  return null;
}
