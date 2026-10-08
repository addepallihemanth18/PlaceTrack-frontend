import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Layout({ title, children }) {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.clear();
    navigate('/');
    window.location.reload();
  };

  return (
    <>
      <nav className="navbar navbar-dark bg-primary px-4">
        <span className="navbar-brand fw-bold">
          PlaceTrack
        </span>

        <div className="text-white">
          {localStorage.getItem('name')}

          <button
            className="btn btn-sm btn-outline-light ms-3"
            onClick={logout}
          >
            Sign out
          </button>
        </div>
      </nav>

      <main className="container py-4">
        <h2 className="mb-4">{title}</h2>

        {children}
      </main>
    </>
  );
}
