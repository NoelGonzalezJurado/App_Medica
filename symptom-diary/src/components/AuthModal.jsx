import { useState } from 'react';
import { Heart, Mail, Lock, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const ERROR_MESSAGES = {
  'Invalid login credentials': 'Email o contraseña incorrectos.',
  'Email not confirmed': 'Revisa tu bandeja de entrada y confirma tu email antes de iniciar sesión.',
  'User already registered': 'Ya existe una cuenta con ese email.',
  'Password should be at least 6 characters': 'La contraseña debe tener al menos 6 caracteres.',
  'is invalid': 'La dirección de email no es válida.',
  'Email rate limit exceeded': 'Demasiados intentos. Espera unos minutos e inténtalo de nuevo.',
  'signup is disabled': 'El registro está desactivado temporalmente.',
};

function translateError(message) {
  if (!message) return 'Ha ocurrido un error. Inténtalo de nuevo.';
  for (const [key, val] of Object.entries(ERROR_MESSAGES)) {
    if (message.includes(key)) return val;
  }
  return message;
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function AuthModal() {
  const { signIn, signUp } = useAuth();

  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  function switchMode() {
    setMode(m => (m === 'login' ? 'register' : 'login'));
    setError(null);
    setFieldErrors({});
  }

  function validate() {
    const errors = {};
    if (!email.trim()) {
      errors.email = 'El email es obligatorio.';
    } else if (!validateEmail(email.trim())) {
      errors.email = 'Introduce un email válido.';
    }
    if (!password) {
      errors.password = 'La contraseña es obligatoria.';
    } else if (password.length < 6) {
      errors.password = 'Mínimo 6 caracteres.';
    }
    return errors;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    setLoading(true);

    const fn = mode === 'login' ? signIn : signUp;
    const { error: authError } = await fn(email.trim(), password);

    setLoading(false);

    if (authError) {
      setError(translateError(authError.message));
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-5 space-y-5">

        {/* Logo + títulos */}
        <div className="flex flex-col items-center gap-2 pt-2">
          <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-400 rounded-2xl flex items-center justify-center shadow-sm">
            <Heart className="w-6 h-6 text-white fill-white" />
          </div>
          <div className="text-center">
            <h1 className="text-lg font-bold text-gray-800 leading-none">Diario Médico</h1>
            <p className="text-sm text-gray-500 mt-1">
              {mode === 'login' ? 'Accede a tu cuenta' : 'Crea tu cuenta'}
            </p>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} noValidate className="space-y-4">

          {/* Email */}
          <div>
            <label className="label" htmlFor="auth-email">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                id="auth-email"
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setFieldErrors(f => ({ ...f, email: undefined })); }}
                placeholder="tu@email.com"
                className={`input-field pl-10 ${fieldErrors.email ? 'border-rose-400 focus:ring-rose-400' : ''}`}
                autoComplete="email"
                autoFocus
              />
            </div>
            {fieldErrors.email && (
              <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 flex-shrink-0" />
                {fieldErrors.email}
              </p>
            )}
          </div>

          {/* Contraseña */}
          <div>
            <label className="label" htmlFor="auth-password">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                id="auth-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => { setPassword(e.target.value); setFieldErrors(f => ({ ...f, password: undefined })); }}
                placeholder="Mínimo 6 caracteres"
                className={`input-field pl-10 pr-11 ${fieldErrors.password ? 'border-rose-400 focus:ring-rose-400' : ''}`}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {fieldErrors.password && (
              <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 flex-shrink-0" />
                {fieldErrors.password}
              </p>
            )}
          </div>

          {/* Error global */}
          {error && (
            <div className="flex items-start gap-2 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2.5">
              <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-rose-700">{error}</p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'
            )}
          </button>
        </form>

        {/* Cambiar modo */}
        <p className="text-center text-sm text-gray-500">
          {mode === 'login' ? (
            <>
              ¿No tienes cuenta?{' '}
              <button
                type="button"
                onClick={switchMode}
                className="text-teal-600 font-semibold hover:underline"
              >
                Crear una
              </button>
            </>
          ) : (
            <>
              ¿Ya tienes cuenta?{' '}
              <button
                type="button"
                onClick={switchMode}
                className="text-teal-600 font-semibold hover:underline"
              >
                Inicia sesión
              </button>
            </>
          )}
        </p>

        {/* Aviso pie */}
        <p className="text-center text-[11px] text-gray-400 leading-snug pb-1">
          Tus datos se guardan de forma segura. La API key solo se almacena en este dispositivo.
        </p>
      </div>
    </div>
  );
}
