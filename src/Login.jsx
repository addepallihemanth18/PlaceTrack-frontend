
import React, { useState } from 'react';
import api from './api';

export default function Login({ onLogin }) {
  const [register, setRegister] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    email: '',
    password: '',
    fullName: '',
    rollNumber: '',
    branch: 'CSE',
    year: 4,
    cgpa: 7,
    phone: ''
  });

  const change = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value
    });
  };

  async function submit(event) {
    event.preventDefault();
    setError('');

    try {
      const response = await api.post(
        register ? '/auth/register' : '/auth/login',
        form
      );

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('role', response.data.role);
      localStorage.setItem('name', response.data.name);

      onLogin(response.data);

    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Unable to sign in. Please try again.'
      );
    }
  }

  return (
    <main className="auth">
      <div className="card shadow border-0">
        <div className="card-body p-4">

          <h2 className="text-primary fw-bold">
            PlaceTrack
          </h2>

          <p className="text-muted">
            College Placement Management System
          </p>

          {error && (
            <div className="alert alert-danger py-2">
              {error}
            </div>
          )}

          <form onSubmit={submit}>

            {register && (
              <>
                <input
                  className="form-control mb-2"
                  name="fullName"
                  placeholder="Full name"
                  onChange={change}
                  required
                />

                <input
                  className="form-control mb-2"
                  name="rollNumber"
                  placeholder="Roll number"
                  onChange={change}
                  required
                />

                <div className="row">
                  <div className="col">
                    <input
                      className="form-control mb-2"
                      name="branch"
                      value={form.branch}
                      onChange={change}
                    />
                  </div>

                  <div className="col">
                    <input
                      className="form-control mb-2"
                      type="number"
                      min="1"
                      max="6"
                      name="year"
                      value={form.year}
                      onChange={change}
                    />
                  </div>
                </div>

                <input
                  className="form-control mb-2"
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  name="cgpa"
                  value={form.cgpa}
                  onChange={change}
                  required
                />

                <input
                  className="form-control mb-2"
                  name="phone"
                  placeholder="Phone number"
                  onChange={change}
                  required
                />
              </>
            )}

            <input
              className="form-control mb-2"
              type="email"
              name="email"
              placeholder="Email"
              onChange={change}
              required
            />

            <input
              className="form-control mb-3"
              type="password"
              minLength="6"
              name="password"
              placeholder="Password"
              onChange={change}
              required
            />

            <button
              className="btn btn-primary w-100"
              type="submit"
            >
              {register
                ? 'Create student account'
                : 'Sign in'}
            </button>

          </form>

          <button
            className="btn btn-link w-100 mt-2"
            onClick={() => {
              setRegister(!register);
              setError('');
            }}
          >
            {register
              ? 'Already registered? Sign in'
              : 'New student? Register'}
          </button>

          <small className="d-block text-center text-muted">
            Admin: admin@placement.edu / Admin@123
          </small>

        </div>
      </div>
    </main>
  );
}

