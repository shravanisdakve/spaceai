import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { BrainCircuit, Eye, EyeOff } from 'lucide-react';
import { Button, Input } from '../components/Common/ui';
import Toast, { ToastType } from '../components/Common/Toast';

const taglines = [
  "Unlock your smarter study session.",
  "Let's pick up where you left off.",
  "Your AI-powered study partner awaits.",
  "Log in to continue your progress."
];

const Login: React.FC = () => {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Toasts State
  const [toasts, setToasts] = useState<{ id: string; message: string; type: ToastType }[]>([]);

  // Validation State
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const navigate = useNavigate();

  const tagline = useMemo(() => taglines[Math.floor(Math.random() * taglines.length)], []);

  const addToast = (message: string, type: ToastType) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 5000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    // Email
    if (!email) {
      newErrors.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address.';
    }

    // Password
    if (!password) {
      newErrors.password = 'Password is required.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      addToast('Please check the errors below.', 'error');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      addToast('Welcome back! Redirecting...', 'success');
      // Short delay to show success message before redirect
      setTimeout(() => navigate('/'), 1000);
    } catch (err: any) {
      addToast(err.message || 'Failed to sign in. Please check your credentials.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 space-y-8 bg-slate-800/50 rounded-xl ring-1 ring-slate-700 relative">
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            id={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={removeToast}
          />
        ))}
      </div>

      <div className="text-center">
        <div className="inline-flex items-center justify-center mb-6">
          <div className="p-2 bg-violet-600 rounded-lg">
            <BrainCircuit className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold ml-3 bg-gradient-to-r from-violet-400 to-cyan-400 text-transparent bg-clip-text">
            NexusAI
          </h1>
        </div>
        <h2 className="text-2xl font-bold text-white">Welcome Back!</h2>
        <p className="mt-2 text-slate-400">{tagline}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            autoComplete="email"
            disabled={loading}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "email-error" : undefined}
            className={errors.email ? "border-red-500 focus:ring-red-500" : ""}
          />
          {errors.email && <p id="email-error" className="mt-1 text-xs text-red-400">{errors.email}</p>}
        </div>
        <div>
          <label htmlFor="password-login" className="block text-sm font-medium text-slate-300 mb-2">Password</label>
          <div className="relative">
            <Input
              id="password-login"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
              disabled={loading}
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? "pass-error" : undefined}
              className={errors.password ? "border-red-500 focus:ring-red-500" : ""}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {errors.password && <p id="pass-error" className="mt-1 text-xs text-red-400">{errors.password}</p>}
        </div>

        <div className="text-right">
          <Link to="/forgot-password" className="text-sm font-medium text-violet-400 hover:text-violet-300">
            Forgot Password?
          </Link>
        </div>

        <Button type="submit" isLoading={loading} className="w-full">
          Log In
        </Button>
      </form>

      <p className="text-sm text-center text-slate-400">
        Don't have an account?{' '}
        <Link to="/signup" className="font-medium text-violet-400 hover:text-violet-300">
          Sign up
        </Link>
      </p>
    </div>
  );
};

export default Login;