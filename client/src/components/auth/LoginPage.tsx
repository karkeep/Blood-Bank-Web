import React from 'react';
import { LoginForm } from './login-form';

const LoginPage = () => {
  return (
    <div className="container mx-auto p-6 flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>
        <LoginForm />
      </div>
    </div>
  );
};

export default LoginPage;