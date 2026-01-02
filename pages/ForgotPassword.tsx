import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { BrainCircuit, ArrowLeft } from 'lucide-react';
import { Button, Input } from '../components/ui';

const ForgotPassword = () => {
  const { resetPassword } = useAuth();
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      await resetPassword(email);
      setMessage('Check your inbox for further instructions.');
    } catch (err: any) {
      setError(err.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 space-y-8 bg-slate-800/50 rounded-xl ring-1 ring-slate-700">
      <div className="text-center">
        <div className="inline-flex items-center justify-center mb-6">
          <div className="p-2 bg-violet-600 rounded-lg">
            <BrainCircuit className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold ml-3 bg-gradient-to-r from-violet-400 to-cyan-400 text-transparent bg-clip-text">
            NexusAI
          </h1>
        </div>
        <h2 className="text-2xl font-bold text-white">Reset Your Password</h2>
        <p className="mt-2 text-slate-400">Enter your email and we'll send you a link to get back into your account.</p>
      </div>
      
      {error && <p className="text-red-400 text-sm text-center bg-red-500/10 p-3 rounded-md">{error}</p>}
      {message && <p className="text-green-400 text-sm text-center bg-green-500/10 p-3 rounded-md">{message}</p>}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
            <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                disabled={loading}
            />
        </div>

        <Button type="submit" isLoading={loading} className="w-full">
         Send Password Reset Email
        </Button>
      </form>

      <p className="text-sm text-center text-slate-400">
        <Link to="/login" className="font-medium text-violet-400 hover:text-violet-300 flex items-center justify-center">
            <ArrowLeft size={16} className="mr-2" /> Back to Login
        </Link>
      </p>
    </div>
  );
};

export default ForgotPassword;
