import React from 'react';
import { RegistrationForm } from './registration-form';

const RegisterPage = () => {
  return (
    <div className="container mx-auto p-6 flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Register</h1>
        <RegistrationForm />
      </div>
    </div>
  );
};

export default RegisterPage;