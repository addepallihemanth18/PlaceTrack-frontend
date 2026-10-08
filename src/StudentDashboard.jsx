import React, { useEffect, useState } from 'react';
import api from './api';
import Applications from './Applications';
import Layout from './Layout';
import StatCard from './StatCard';

const toProfileForm = (student) => ({
  branch: student.branch || '',
  year: student.year ?? '',
  cgpa: student.cgpa ?? '',
  phone: student.phone || '',
  skills: (student.skills || []).join(', ')
});

export default function StudentDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [drives, setDrives] = useState([]);
  const [applications, setApplications] = useState([]);
  const [profile, setProfile] = useState(null);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');

  async function load() {
    try {
      const [dashboardResponse, drivesResponse, applicationsResponse] = await Promise.all([
        api.get('/students/dashboard'),
        api.get('/drives', { params: { active: true, search } }),
        api.get('/applications/my')
      ]);

      setDashboard(dashboardResponse.data);
      setDrives(drivesResponse.data);
      setApplications(applicationsResponse.data);
      // Fill the profile form once; later reloads must not overwrite edits in progress.
      setProfile((current) => current ?? toProfileForm(dashboardResponse.data.student));
    } catch (err) {
      setMessage(err.response?.data?.message || 'Could not load dashboard data. Check that the backend is running on port 8080.');
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function apply(driveId) {
    try {
      await api.post(`/applications/drives/${driveId}`);
      setMessage('Application submitted.');
      load();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Could not apply for this drive.');
    }
  }

  async function saveProfile(e) {
    e.preventDefault();
    try {
      const response = await api.put('/students/profile', {
        branch: profile.branch,
        year: profile.year === '' ? null : Number(profile.year),
        cgpa: profile.cgpa === '' ? null : Number(profile.cgpa),
        phone: profile.phone,
        skills: profile.skills.split(',').map(x => x.trim()).filter(Boolean)
      });
      setProfile(toProfileForm(response.data));
      setMessage('Profile saved.');
      load();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Could not save your profile.');
    }
  }

  const appliedDriveIds = new Set(applications.map((a) => a.drive?.id));
  const edit = (field) => (e) => setProfile({ ...profile, [field]: e.target.value });

  return (
    <Layout title="Student Portal">
      {message && <div className="alert alert-info">{message}</div>}

      {dashboard && (
        <div className="row g-3 mb-4">
          <StatCard label="Eligible drives" value={dashboard.availableDrives} />
          <StatCard label="Applications" value={dashboard.applications} />
          <StatCard label="Shortlisted" value={dashboard.shortlisted} color="info" />
          <StatCard label="Selected" value={dashboard.selected} color="success" />
        </div>
      )}

      {profile && (
        <form className="card mb-4" onSubmit={saveProfile}>
          <div className="card-body">
            <h4>My profile</h4>
            <p className="text-muted small">
              Drives check your CGPA, branch and skills. Add every skill you have so you can apply to the drives that ask for them.
            </p>
            <div className="row g-2 mb-2">
              <div className="col-md-4">
                <label className="form-label small mb-1">Branch</label>
                <input className="form-control" value={profile.branch} onChange={edit('branch')} required />
              </div>
              <div className="col-md-2 col-6">
                <label className="form-label small mb-1">Year</label>
                <input className="form-control" type="number" min="1" max="6" value={profile.year} onChange={edit('year')} />
              </div>
              <div className="col-md-2 col-6">
                <label className="form-label small mb-1">CGPA</label>
                <input className="form-control" type="number" step="0.01" min="0" max="10" value={profile.cgpa} onChange={edit('cgpa')} />
              </div>
              <div className="col-md-4">
                <label className="form-label small mb-1">Phone</label>
                <input className="form-control" value={profile.phone} onChange={edit('phone')} />
              </div>
            </div>
            <label className="form-label small mb-1">Skills, comma separated</label>
            <input className="form-control mb-3" placeholder="Java, SQL, React" value={profile.skills} onChange={edit('skills')} />
            <button className="btn btn-primary" type="submit">Save profile</button>
          </div>
        </form>
      )}

      <section className="card mb-4">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4>Available placement drives</h4>

            <div className="input-group search">
              <input
                className="form-control"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && load()}
                placeholder="Company or job title"
              />
              <button className="btn btn-outline-primary" onClick={load}>Search</button>
            </div>
          </div>

          <div className="row g-3">
            {drives.map((drive) => {
              const applied = appliedDriveIds.has(drive.id);
              return (
                <div className="col-md-6" key={drive.id}>
                  <div className="drive p-3 h-100">
                    <div className="d-flex justify-content-between">
                      <h5>{drive.jobTitle}</h5>
                      <span className="badge text-bg-primary align-self-start">{drive.jobType}</span>
                    </div>

                    <b>{drive.company.name}</b>

                    <p className="text-muted mb-2">
                      {drive.jobLocation} · {drive.salaryPackage} · Min CGPA {drive.minimumCgpa}
                    </p>

                    <small>
                      Deadline: {drive.applicationDeadline} · Skills:{' '}
                      {drive.requiredSkills?.join(', ') || 'None'}
                    </small>

                    <button
                      className="btn btn-primary btn-sm d-block mt-3"
                      disabled={applied}
                      onClick={() => apply(drive.id)}
                    >
                      {applied ? 'Applied' : 'Check & apply'}
                    </button>
                  </div>
                </div>
              );
            })}

            {!drives.length && (
              <div className="col-12">
                <p className="text-muted">No open placement drives right now. Check back after the placement office adds one.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <Applications applications={applications} />
    </Layout>
  );
}
