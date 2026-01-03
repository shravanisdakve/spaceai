import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { BrainCircuit, Eye, EyeOff, Check, X } from 'lucide-react';
import { Button, Input } from '../components/Common/ui';
import Toast, { ToastType } from '../components/Common/Toast';

const Signup: React.FC = () => {
  const { signup } = useAuth();
  const [loading, setLoading] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [university, setUniversity] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Validation State
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Password Strength State
  const [strengthScore, setStrengthScore] = useState(0);

  // Toasts State
  const [toasts, setToasts] = useState<{ id: string; message: string; type: ToastType }[]>([]);

  const navigate = useNavigate();

  // Calculate Password Strength
  useEffect(() => {
    let score = 0;
    if (!password) {
      setStrengthScore(0);
      return;
    }
    if (password.length >= 8) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[!@#$%^&*]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    setStrengthScore(score);
  }, [password]);

  const getStrengthColor = () => {
    if (strengthScore <= 1) return 'bg-red-500';
    if (strengthScore === 2) return 'bg-yellow-500';
    if (strengthScore === 3) return 'bg-blue-500';
    return 'bg-emerald-500';
  };

  const getStrengthLabel = () => {
    if (strengthScore === 0) return '';
    if (strengthScore <= 1) return 'Weak';
    if (strengthScore === 2) return 'Fair';
    if (strengthScore === 3) return 'Good';
    return 'Strong';
  };

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

    // Display Name
    if (displayName.length < 2 || displayName.length > 50) {
      newErrors.displayName = 'Display Name must be between 2 and 50 characters.';
    }

    // University
    if (university.length < 2 || university.length > 100) {
      newErrors.university = 'University Name must be between 2 and 100 characters.';
    }

    // Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      newErrors.email = 'Please enter a valid email address.';
    }

    // Password Strength
    const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/;
    if (!passwordRegex.test(password)) {
      newErrors.password = 'Must satisfy: 8+ chars, 1 number, 1 special char.';
    }

    // Password Match
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    // Terms
    if (!agreedToTerms) {
      newErrors.terms = 'You must agree to the Terms of Service.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      addToast('Please fix the errors in the form.', 'error');
      return;
    }

    setLoading(true);
    try {
      await signup(displayName, email, password, university);
      addToast('Account created successfully! Redirecting...', 'success');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err: any) {
      addToast(err.message || 'Failed to create an account. Please try again.', 'error');
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
        <h2 className="text-2xl font-bold text-white">Create your Account</h2>
        <p className="mt-2 text-slate-400">Join NexusAI to supercharge your studies.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        <div>
          <label htmlFor="displayName" className="block text-sm font-medium text-slate-300 mb-2">
            Full Name <span className="text-slate-500 text-xs">(This will be displayed to other users)</span>
          </label>
          <Input
            id="displayName"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="John Doe"
            required
            disabled={loading}
            aria-invalid={!!errors.displayName}
            aria-describedby={errors.displayName ? "name-error" : undefined}
            className={errors.displayName ? "border-red-500 focus:ring-red-500" : ""}
          />
          {errors.displayName && <p id="name-error" className="mt-1 text-xs text-red-400">{errors.displayName}</p>}
        </div>
        <div>
          <label htmlFor="university" className="block text-sm font-medium text-slate-300 mb-2">
            University Name <span className="text-slate-500 text-xs">(e.g., University of California, Berkeley)</span>
          </label>
          <Input
            id="university"
            type="text"
            value={university}
            onChange={(e) => setUniversity(e.target.value)}
            placeholder="State University"
            required
            disabled={loading}
            aria-invalid={!!errors.university}
            aria-describedby={errors.university ? "uni-error" : undefined}
            className={errors.university ? "border-red-500 focus:ring-red-500" : ""}
          />
          {errors.university && <p id="uni-error" className="mt-1 text-xs text-red-400">{errors.university}</p>}
        </div>
        <div>
          <label htmlFor="email-signup" className="block text-sm font-medium text-slate-300 mb-2">
            Email Address <span className="text-slate-500 text-xs">(We'll use this for login and account recovery)</span>
          </label>
          <Input
            id="email-signup"
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
          <label htmlFor="password-signup" className="block text-sm font-medium text-slate-300 mb-2">
            Password
            {password && (
              <span className={`ml-2 text-xs font-medium px-2 py-0.5 rounded ${getStrengthColor()} text-white transition-colors duration-300`}>
                {getStrengthLabel()}
              </span>
            )}
          </label>
          <div className="relative">
            <Input
              id="password-signup"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="new-password"
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

          {/* Visual Password Strength Meter */}
          <div className="flex h-1 mt-2 mb-1 gap-1">
            <div className={`h-full flex-1 rounded-full transition-all duration-300 ${strengthScore >= 1 ? getStrengthColor() : 'bg-slate-700'}`}></div>
            <div className={`h-full flex-1 rounded-full transition-all duration-300 ${strengthScore >= 2 ? getStrengthColor() : 'bg-slate-700'}`}></div>
            <div className={`h-full flex-1 rounded-full transition-all duration-300 ${strengthScore >= 3 ? getStrengthColor() : 'bg-slate-700'}`}></div>
            <div className={`h-full flex-1 rounded-full transition-all duration-300 ${strengthScore >= 4 ? getStrengthColor() : 'bg-slate-700'}`}></div>
          </div>

          {/* Password Requirements Checklist */}
          <div className="mt-2 space-y-1">
            <div className={`flex items-center text-xs ${password.length >= 8 ? 'text-emerald-400' : 'text-slate-500'}`}>
              {password.length >= 8 ? <Check size={12} className="mr-1" /> : <div className="w-3 h-3 mr-1 rounded-full border border-slate-600" />}
              At least 8 characters
            </div>
            <div className={`flex items-center text-xs ${/[0-9]/.test(password) ? 'text-emerald-400' : 'text-slate-500'}`}>
              {/[0-9]/.test(password) ? <Check size={12} className="mr-1" /> : <div className="w-3 h-3 mr-1 rounded-full border border-slate-600" />}
              At least one number
            </div>
            <div className={`flex items-center text-xs ${/[!@#$%^&*]/.test(password) ? 'text-emerald-400' : 'text-slate-500'}`}>
              {/[!@#$%^&*]/.test(password) ? <Check size={12} className="mr-1" /> : <div className="w-3 h-3 mr-1 rounded-full border border-slate-600" />}
              At least one special char (@ # $ % ^ & *)
            </div>
          </div>

          {errors.password ? (
            <p id="pass-error" className="mt-1 text-xs text-red-400">{errors.password}</p>
          ) : (
            <p className="text-xs text-slate-500">Must be at least 8 characters and include a number and a special character @ # $ % ^ & *.</p>
          )}
        </div>
        <div>
          <label htmlFor="confirm-password-signup" className="block text-sm font-medium text-slate-300 mb-2">Confirm Password</label>
          <div className="relative">
            <Input
              id="confirm-password-signup"
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="new-password"
              disabled={loading}
              aria-invalid={!!errors.confirmPassword}
              aria-describedby={errors.confirmPassword ? "confirm-pass-error" : undefined}
              className={errors.confirmPassword ? "border-red-500 focus:ring-red-500" : ""}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200"
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {errors.confirmPassword && <p id="confirm-pass-error" className="mt-1 text-xs text-red-400">{errors.confirmPassword}</p>}
        </div>

        <div className="flex items-center">
          <input
            id="terms"
            name="terms"
            type="checkbox"
            checked={agreedToTerms}
            onChange={(e) => setAgreedToTerms(e.target.checked)}
            className={`h-4 w-4 text-violet-600 focus:ring-violet-500 border-gray-300 rounded ${errors.terms ? 'ring-2 ring-red-500' : ''}`}
            aria-invalid={!!errors.terms}
          />
          <label htmlFor="terms" className="ml-2 block text-sm text-slate-400">
            I agree to the{' '}
            <Link to="/terms" className="font-medium text-violet-400 hover:text-violet-300">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link to="/privacy" className="font-medium text-violet-400 hover:text-violet-300">
              Privacy Policy
            </Link>
            .
          </label>
        </div>
        {errors.terms && <p className="text-xs text-red-400">{errors.terms}</p>}

        <Button type="submit" isLoading={loading} disabled={loading} className="w-full">
          Create Account
        </Button>
      </form>

      <p className="text-sm text-center text-slate-400">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-violet-400 hover:text-violet-300">
          Log in
        </Link>
      </p>
    </div>
  );
};

export default Signup;