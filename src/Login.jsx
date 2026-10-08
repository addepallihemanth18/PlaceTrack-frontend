
import React, { useState } from 'react';
import api from './api';
import './Login.css';

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
    <main className="auth-page">

      {/* LEFT SIDE */}
      <section className="auth-brand">

        <div className="brand-content">

          <div className="brand-logo">
            <div className="logo-icon">P</div>
            <span>PlaceTrack</span>
          </div>

          <h1>
            Your career journey
            <span> starts here.</span>
          </h1>

          <p className="brand-description">
            A smarter way to manage college placements,
            track applications and stay ahead of your career.
          </p>

          <div className="features">

            <div className="feature">
              <div className="feature-icon">✓</div>
              <div>
                <strong>Track Applications</strong>
                <p>Keep your placement journey organized.</p>
              </div>
            </div>

            <div className="feature">
              <div className="feature-icon">⌁</div>
              <div>
                <strong>Discover Opportunities</strong>
                <p>Stay updated with the latest drives.</p>
              </div>
            </div>

            <div className="feature">
              <div className="feature-icon">↗</div>
              <div>
                <strong>Build Your Career</strong>
                <p>Move closer to your dream company.</p>
              </div>
            </div>

          </div>

          <div className="brand-footer">
            <span>●</span> Built for students & placement teams
          </div>

        </div>

      </section>


      {/* RIGHT SIDE */}
      <section className="auth-form-section">

        <div className="login-card">

          <div className="mobile-logo">
            <div className="logo-icon">P</div>
            <span>PlaceTrack</span>
          </div>

          <div className="form-heading">
            <h2>
              {register ? 'Create your account' : 'Welcome back'}
            </h2>

            <p>
              {register
                ? 'Start your placement journey with PlaceTrack.'
                : 'Sign in to continue to your dashboard.'}
            </p>
          </div>

          {error && (
            <div className="error-box">
              <span>!</span>
              {error}
            </div>
          )}

          <form onSubmit={submit}>

            {register && (
              <div className="register-fields">

                <div className="input-group-custom">
                  <label>Full Name</label>
                  <div className="input-wrapper">
                    <span className="input-icon">👤</span>
                    <input
                      name="fullName"
                      placeholder="Enter your full name"
                      onChange={change}
                      required
                    />
                  </div>
                </div>

                <div className="input-group-custom">
                  <label>Roll Number</label>
                  <div className="input-wrapper">
                    <span className="input-icon">#</span>
                    <input
                      name="rollNumber"
                      placeholder="Enter your roll number"
                      onChange={change}
                      required
                    />
                  </div>
                </div>

                <div className="two-columns">

                  <div className="input-group-custom">
                    <label>Branch</label>
                    <div className="input-wrapper">
                      <span className="input-icon">⌘</span>
                      <input
                        name="branch"
                        value={form.branch}
                        onChange={change}
                        placeholder="CSE"
                      />
                    </div>
                  </div>

                  <div className="input-group-custom">
                    <label>Year</label>
                    <div className="input-wrapper">
                      <span className="input-icon">▣</span>
                      <input
                        type="number"
                        min="1"
                        max="6"
                        name="year"
                        value={form.year}
                        onChange={change}
                      />
                    </div>
                  </div>

                </div>

                <div className="two-columns">

                  <div className="input-group-custom">
                    <label>CGPA</label>
                    <div className="input-wrapper">
                      <span className="input-icon">★</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="10"
                        name="cgpa"
                        value={form.cgpa}
                        onChange={change}
                        required
                      />
                    </div>
                  </div>

                  <div className="input-group-custom">
                    <label>Phone</label>
                    <div className="input-wrapper">
                      <span className="input-icon">☎</span>
                      <input
                        name="phone"
                        placeholder="Phone number"
                        onChange={change}
                        required
                      />
                    </div>
                  </div>

                </div>

              </div>
            )}

            <div className="input-group-custom">
              <label>Email Address</label>

              <div className="input-wrapper">
                <span className="input-icon">@</span>

                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  onChange={change}
                  required
                />
              </div>
            </div>


            <div className="input-group-custom">
              <div className="password-label">
                <label>Password</label>

                {!register && (
                  <button
                    type="button"
                    className="forgot-password"
                  >
                    Forgot password?
                  </button>
                )}
              </div>

              <div className="input-wrapper">
                <span className="input-icon">🔒</span>

                <input
                  type="password"
                  minLength="6"
                  name="password"
                  placeholder="Enter your password"
                  onChange={change}
                  required
                />
              </div>
            </div>


            <button
              className="submit-button"
              type="submit"
            >
              <span>
                {register
                  ? 'Create Student Account'
                  : 'Sign In'}
              </span>

              <span className="arrow">→</span>
            </button>

          </form>


          <div className="switch-auth">

            <span>
              {register
                ? 'Already have an account?'
                : "Don't have an account?"}
            </span>

            <button
              onClick={() => {
                setRegister(!register);
                setError('');
              }}
            >
              {register ? 'Sign in' : 'Create account'}
            </button>

          </div>


          <div className="security-note">
            <span>🔐</span>
            Your information is securely protected
          </div>


          <div className="admin-note">
            <strong>Admin access</strong>
            <span>admin@placement.edu</span>
          </div>

        </div>

      </section>

    </main>
  );
}
