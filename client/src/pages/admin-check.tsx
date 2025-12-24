import React from 'react';
import { Helmet } from 'react-helmet';
import AdminCheck from '@/components/admin/AdminCheck';

const AdminCheckPage = () => {
  return (
    <div className="container mx-auto p-4">
      <Helmet>
        <title>Admin Check - Jiwandan</title>
        <meta name="description" content="Check your admin access status in Jiwandan." />
      </Helmet>
      
      <AdminCheck />
    </div>
  );
};

export default AdminCheckPage;