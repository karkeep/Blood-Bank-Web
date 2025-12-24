/**
 * Organization Login Page
 * Login portal for hospitals and blood banks (registration only via admin panel)
 */
import { useState } from 'react';
import { useLocation } from 'wouter';
import { Droplets, Lock, Mail, Eye, EyeOff, Loader2, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useOrganizationAuth } from '@/hooks/use-organization-auth';

export function OrganizationLoginPage() {
    const [, navigate] = useLocation();
    const { login, isLoading, error } = useOrganizationAuth();

    const [mode, setMode] = useState<'login' | 'forgot'>('login');
    const [showPassword, setShowPassword] = useState(false);
    const [success, setSuccess] = useState<string | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setSuccess(null);

        const result = await login({
            email: formData.email,
            password: formData.password,
        });

        if (result.success) {
            navigate('/org/dashboard');
        }
    };

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setSuccess(null);

        // In a real implementation, this would call an API to send reset email
        // For now, just show a success message
        setSuccess(`If an account exists for ${formData.email}, a password reset link will be sent.`);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo/Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-red-600 rounded-2xl mb-4 shadow-lg">
                        <Droplets className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Organization Portal</h1>
                    <p className="text-gray-600 mt-1">
                        Hospitals & Blood Banks Data Management
                    </p>
                </div>

                {/* Login Card */}
                <Card className="p-6 shadow-xl border-0">
                    {/* Error Message */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            <p>{error}</p>
                        </div>
                    )}

                    {/* Success Message */}
                    {success && (
                        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700 text-sm">
                            <CheckCircle className="w-4 h-4 flex-shrink-0" />
                            <p>{success}</p>
                        </div>
                    )}

                    {/* Login Form */}
                    {mode === 'login' && (
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="organization@example.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="pl-10"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <Input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Enter your password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className="pl-10 pr-10"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between text-sm">
                                <label className="flex items-center gap-2">
                                    <input type="checkbox" className="rounded border-gray-300" />
                                    <span className="text-gray-600">Remember me</span>
                                </label>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setMode('forgot');
                                        setSuccess(null);
                                    }}
                                    className="text-red-600 hover:underline"
                                >
                                    Forgot password?
                                </button>
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-red-600 hover:bg-red-700"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Signing in...</>
                                ) : (
                                    'Sign In'
                                )}
                            </Button>
                        </form>
                    )}

                    {/* Forgot Password Form */}
                    {mode === 'forgot' && (
                        <form onSubmit={handleForgotPassword} className="space-y-4">
                            <button
                                type="button"
                                onClick={() => {
                                    setMode('login');
                                    setSuccess(null);
                                }}
                                className="flex items-center gap-1 text-sm text-gray-600 hover:text-red-600 mb-4"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back to login
                            </button>

                            <div className="text-center mb-4">
                                <h2 className="text-lg font-semibold text-gray-900">Reset Password</h2>
                                <p className="text-sm text-gray-600 mt-1">
                                    Enter your email address and we'll send you a link to reset your password.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="resetEmail">Email Address</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <Input
                                        id="resetEmail"
                                        type="email"
                                        placeholder="organization@example.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="pl-10"
                                        required
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-red-600 hover:bg-red-700"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending...</>
                                ) : (
                                    'Send Reset Link'
                                )}
                            </Button>
                        </form>
                    )}

                    {/* Info notice */}
                    <div className="mt-6 pt-4 border-t border-gray-100">
                        <p className="text-xs text-gray-500 text-center">
                            Organization accounts are created by Jiwandan administrators.
                            Contact <a href="mailto:contact@jiwandan.com" className="text-red-600 hover:underline">contact@jiwandan.com</a> if you need access.
                        </p>
                    </div>
                </Card>

                {/* Footer */}
                <div className="text-center mt-6 text-sm text-gray-600">
                    <p>Need help? <a href="/about/contact" className="text-red-600 hover:underline">Contact Support</a></p>
                    <p className="mt-2">
                        <a href="/" className="text-red-600 hover:underline">← Back to Main Site</a>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default OrganizationLoginPage;
