import React, { useState } from 'react';
import Login from './Login';
import StudentDashboard from './StudentDashboard';
import AdminDashboard from './AdminDashboard';

export default function App() {
  const [user, setUser] = useState(localStorage.getItem('token') ? { role: localStorage.getItem('role') } : null);
  if (!user) return <Login onLogin={setUser} />;
  return user.role === 'ROLE_ADMIN' ? <AdminDashboard /> : <StudentDashboard />;
}
