import React, { useEffect, useMemo, useState } from 'react';
import api from './api';
import Layout from './Layout';

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

const emptyCompany = {
  name: '',
  industry: '',
  location: '',
  website: '',
  description: '',
};

const emptyDrive = {
  companyId: '',
  jobTitle: '',
  jobDescription: '',
  salaryPackage: '',
  jobLocation: '',
  driveDate: '',
  applicationDeadline: '',
  minimumCgpa: 7,
  eligibleBranches: 'CSE',
  jobType: 'FULL_TIME',
  requiredSkills: '',
  active: true,
};

const statuses = [
  'APPLIED',
  'SHORTLISTED',
  'INTERVIEW',
  'SELECTED',
  'REJECTED',
];

const chartColors = [
  '#111111',
  '#2563eb',
  '#10b981',
  '#f59e0b',
  '#ef4444',
];

export default function AdminDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [drives, setDrives] = useState([]);
  const [students, setStudents] = useState([]);
  const [applicants, setApplicants] = useState([]);

  const [selectedDrive, setSelectedDrive] = useState(null);

  const [companyForm, setCompanyForm] = useState(emptyCompany);
  const [driveForm, setDriveForm] = useState(emptyDrive);

  const [editingCompanyId, setEditingCompanyId] = useState(null);
  const [editingDriveId, setEditingDriveId] = useState(null);

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const [tab, setTab] = useState('overview');

  const today = useMemo(
    () => new Date().toISOString().slice(0, 10),
    []
  );

  function showError(err, fallback) {
    setError(
      err.response?.data?.message ||
      err.response?.data?.error ||
      fallback
    );

    setMessage('');
  }

  async function loadAll() {
    try {
      setError('');

      const [dashboardResponse, companiesResponse, drivesResponse, studentsResponse] =
        await Promise.all([
          api.get('/admin/dashboard'),
          api.get('/admin/companies'),
          api.get('/drives'),
          api.get('/admin/students'),
        ]);

      setDashboard(dashboardResponse.data);

      setCompanies(
        Array.isArray(companiesResponse.data)
          ? companiesResponse.data
          : []
      );

      setDrives(
        Array.isArray(drivesResponse.data)
          ? drivesResponse.data
          : []
      );

      setStudents(
        Array.isArray(studentsResponse.data)
          ? studentsResponse.data
          : []
      );
    } catch (err) {
      console.error('Admin dashboard error:', err);

      showError(
        err,
        'Could not load dashboard data.'
      );
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  /* ---------------- COMPANY ---------------- */

  async function addOrUpdateCompany(e) {
    e.preventDefault();

    setBusy(true);
    setError('');
    setMessage('');

    try {
      if (editingCompanyId) {
        await api.put(
          `/admin/companies/${editingCompanyId}`,
          companyForm
        );

        setMessage('Company updated successfully.');
      } else {
        await api.post(
          '/admin/companies',
          companyForm
        );

        setMessage('Company added successfully.');
      }

      setCompanyForm({ ...emptyCompany });
      setEditingCompanyId(null);

      await loadAll();
    } catch (err) {
      showError(
        err,
        'Could not save company.'
      );
    } finally {
      setBusy(false);
    }
  }

  function editCompany(company) {
    setEditingCompanyId(company.id);

    setCompanyForm({
      name: company.name || '',
      industry: company.industry || '',
      location: company.location || '',
      website: company.website || '',
      description: company.description || '',
    });

    setTab('companies');

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }

  async function deleteCompany(id) {
    if (!id) {
      setError('Company ID is missing.');
      return;
    }

    const confirmed = window.confirm(
      'Are you sure you want to delete this company?'
    );

    if (!confirmed) return;

    try {
      await api.delete(
        `/admin/companies/${id}`
      );

      setMessage(
        'Company deleted successfully.'
      );

      await loadAll();
    } catch (err) {
      showError(
        err,
        'Could not delete company.'
      );
    }
  }

  /* ---------------- DRIVE ---------------- */

  function createDrivePayload() {
    return {
      ...driveForm,

      companyId: Number(
        driveForm.companyId
      ),

      minimumCgpa: Number(
        driveForm.minimumCgpa
      ),

      requiredSkills:
        driveForm.requiredSkills
          .split(',')
          .map((skill) => skill.trim())
          .filter(Boolean),

      active: Boolean(
        driveForm.active
      ),
    };
  }

  async function addOrUpdateDrive(e) {
    e.preventDefault();

    if (!driveForm.companyId) {
      setError(
        'Please select a company.'
      );
      return;
    }

    setBusy(true);
    setError('');
    setMessage('');

    try {
      const payload =
        createDrivePayload();

      if (editingDriveId) {
        await api.put(
          `/admin/drives/${editingDriveId}`,
          payload
        );

        setMessage(
          'Placement drive updated successfully.'
        );
      } else {
        await api.post(
          '/admin/drives',
          payload
        );

        setMessage(
          'Placement drive created successfully.'
        );
      }

      setDriveForm({ ...emptyDrive });
      setEditingDriveId(null);

      await loadAll();
    } catch (err) {
      showError(
        err,
        'Could not save placement drive.'
      );
    } finally {
      setBusy(false);
    }
  }

  function editDrive(drive) {
    setEditingDriveId(drive.id);

    setDriveForm({
      companyId:
        drive.company?.id || '',

      jobTitle:
        drive.jobTitle || '',

      jobDescription:
        drive.jobDescription || '',

      salaryPackage:
        drive.salaryPackage || '',

      jobLocation:
        drive.jobLocation || '',

      driveDate:
        drive.driveDate || '',

      applicationDeadline:
        drive.applicationDeadline || '',

      minimumCgpa:
        drive.minimumCgpa ?? 0,

      eligibleBranches:
        drive.eligibleBranches || '',

      jobType:
        drive.jobType || 'FULL_TIME',

      requiredSkills:
        (drive.requiredSkills || [])
          .join(', '),

      active:
        drive.active !== false,
    });

    setTab('drives');

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }

  async function deleteDrive(id) {
    if (!id) {
      setError(
        'Drive ID is missing.'
      );
      return;
    }

    const confirmed =
      window.confirm(
        'Are you sure you want to delete this placement drive?'
      );

    if (!confirmed) return;

    try {
      await api.delete(
        `/admin/drives/${id}`
      );

      setMessage(
        'Placement drive deleted successfully.'
      );

      if (
        selectedDrive?.id === id
      ) {
        setSelectedDrive(null);
        setApplicants([]);
      }

      await loadAll();
    } catch (err) {
      showError(
        err,
        'Could not delete placement drive.'
      );
    }
  }

  /* ---------------- APPLICATIONS ---------------- */

  async function viewApplicants(drive) {
    try {
      const response =
        await api.get(
          `/admin/drives/${drive.id}/applications`
        );

      setSelectedDrive(drive);

      setApplicants(
        Array.isArray(response.data)
          ? response.data
          : []
      );

      setTab('applications');

      setError('');
    } catch (err) {
      showError(
        err,
        'Could not load applicants.'
      );
    }
  }

  async function changeStatus(
    applicationId,
    status
  ) {
    try {
      await api.put(
        `/admin/applications/${applicationId}/status`,
        { status }
      );

      setMessage(
        'Application status updated.'
      );

      if (selectedDrive) {
        await viewApplicants(
          selectedDrive
        );
      }

      await loadAll();
    } catch (err) {
      showError(
        err,
        'Could not update application status.'
      );
    }
  }

  /* ---------------- CHART DATA ---------------- */

  const statusChartData = useMemo(() => {
    const data =
      dashboard?.applicationsByStatus || {};

    return Object.entries(data).map(
      ([name, value]) => ({
        name,
        value: Number(value) || 0,
      })
    );
  }, [dashboard]);

  const branchChartData = useMemo(() => {
    const counts = {};

    students.forEach((student) => {
      const branch =
        student.branch || 'Unknown';

      counts[branch] =
        (counts[branch] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([name, students]) => ({
        name,
        students,
      }))
      .sort(
        (a, b) =>
          b.students - a.students
      )
      .slice(0, 8);
  }, [students]);

  const companyDriveData = useMemo(() => {
    const counts = {};

    drives.forEach((drive) => {
      const company =
        drive.company?.name ||
        'Unknown';

      counts[company] =
        (counts[company] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([name, drives]) => ({
        name:
          name.length > 16
            ? `${name.slice(0, 16)}…`
            : name,
        drives,
      }))
      .slice(0, 8);
  }, [drives]);

  const overviewTrendData = useMemo(() => {
    const total =
      Number(
        dashboard?.totalApplications
      ) || 0;

    const selected =
      Number(
        dashboard?.selectedStudents
      ) || 0;

    const active =
      Number(
        dashboard?.activeDrives
      ) || 0;

    return [
      {
        name: 'Students',
        value: Number(
          dashboard?.totalStudents
        ) || 0,
      },
      {
        name: 'Companies',
        value: Number(
          dashboard?.totalCompanies
        ) || 0,
      },
      {
        name: 'Drives',
        value: active,
      },
      {
        name: 'Applications',
        value: total,
      },
      {
        name: 'Selected',
        value: selected,
      },
    ];
  }, [dashboard]);

  /* ---------------- NAVIGATION ---------------- */

  function nav(name) {
    setTab(name);
    setError('');
    setMessage('');
  }

  return (
    <Layout title="Placement Officer Dashboard">

      {/* ================= HEADER ================= */}

      <div className="admin-hero">

        <div>
          <div className="eyebrow">
            PLACEMENT MANAGEMENT
          </div>

          <h1>
            Placement
            <span> Command Center.</span>
          </h1>

          <p>
            Monitor students, companies,
            placement drives and application
            progress from one workspace.
          </p>
        </div>

        <div className="hero-date">
          <span>ADMINISTRATOR</span>
          <strong>
            {new Date().toLocaleDateString(
              'en-IN',
              {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              }
            )}
          </strong>
        </div>

      </div>

      {/* ================= ALERT ================= */}

      {(message || error) && (
        <div
          className={
            error
              ? 'premium-alert error'
              : 'premium-alert success'
          }
        >
          <span>
            {error || message}
          </span>

          <button
            type="button"
            onClick={() => {
              setError('');
              setMessage('');
            }}
          >
            ×
          </button>
        </div>
      )}

      {/* ================= NAVIGATION ================= */}

      <nav className="admin-nav">

        {[
          ['overview', 'Overview'],
          ['companies', 'Companies'],
          ['drives', 'Placement Drives'],
          ['students', 'Students'],
          ['applications', 'Applications'],
        ].map(([key, label]) => (
          <button
            key={key}
            type="button"
            className={
              tab === key
                ? 'active'
                : ''
            }
            onClick={() =>
              nav(key)
            }
          >
            {label}
          </button>
        ))}

      </nav>

      {/* ================= OVERVIEW ================= */}

      {tab === 'overview' && dashboard && (
        <div className="dashboard-content">

          {/* KPI ROW */}

          <div className="metric-grid">

            <Metric
              label="Students"
              value={
                dashboard.totalStudents
              }
              detail="Registered candidates"
              index="01"
            />

            <Metric
              label="Companies"
              value={
                dashboard.totalCompanies
              }
              detail="Partner organizations"
              index="02"
            />

            <Metric
              label="Active drives"
              value={
                dashboard.activeDrives
              }
              detail="Currently open"
              index="03"
            />

            <Metric
              label="Applications"
              value={
                dashboard.totalApplications
              }
              detail="Total submissions"
              index="04"
            />

            <Metric
              label="Selected"
              value={
                dashboard.selectedStudents
              }
              detail="Successful candidates"
              index="05"
            />

          </div>

          {/* CHART GRID */}

          <div className="chart-grid">

            {/* APPLICATION STATUS */}

            <section className="premium-panel large-chart">

              <PanelHeader
                eyebrow="APPLICATION PIPELINE"
                title="Application status"
                subtitle="Current distribution of placement applications"
              />

              <div className="chart-container">

                {statusChartData.length > 0 ? (
                  <ResponsiveContainer
                    width="100%"
                    height={310}
                  >
                    <AreaChart
                      data={statusChartData}
                    >
                      <defs>
                        <linearGradient
                          id="applicationGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor="#111111"
                            stopOpacity={0.22}
                          />

                          <stop
                            offset="100%"
                            stopColor="#111111"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>

                      <CartesianGrid
                        stroke="#eeeeee"
                        vertical={false}
                      />

                      <XAxis
                        dataKey="name"
                        tick={{
                          fill: '#737373',
                          fontSize: 12,
                        }}
                        axisLine={false}
                        tickLine={false}
                      />

                      <YAxis
                        allowDecimals={false}
                        tick={{
                          fill: '#737373',
                          fontSize: 12,
                        }}
                        axisLine={false}
                        tickLine={false}
                      />

                      <Tooltip
                        contentStyle={{
                          borderRadius: 14,
                          border: '1px solid #e5e5e5',
                          boxShadow:
                            '0 15px 40px rgba(0,0,0,.08)',
                        }}
                      />

                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#111111"
                        strokeWidth={3}
                        fill="url(#applicationGradient)"
                      />

                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyChart text="No application data yet." />
                )}

              </div>

            </section>

            {/* STATUS DONUT */}

            <section className="premium-panel">

              <PanelHeader
                eyebrow="PIPELINE MIX"
                title="Application mix"
                subtitle="Share by current status"
              />

              <div className="donut-wrapper">

                {statusChartData.length > 0 ? (
                  <>
                    <ResponsiveContainer
                      width="100%"
                      height={260}
                    >
                      <PieChart>

                        <Pie
                          data={statusChartData}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={72}
                          outerRadius={104}
                          paddingAngle={4}
                        >
                          {statusChartData.map(
                            (entry, index) => (
                              <Cell
                                key={`cell-${entry.name}`}
                                fill={
                                  chartColors[
                                    index %
                                    chartColors.length
                                  ]
                                }
                              />
                            )
                          )}
                        </Pie>

                        <Tooltip />

                      </PieChart>
                    </ResponsiveContainer>

                    <div className="chart-legend">

                      {statusChartData.map(
                        (item, index) => (
                          <div
                            key={item.name}
                          >
                            <span
                              className="legend-dot"
                              style={{
                                background:
                                  chartColors[
                                    index %
                                    chartColors.length
                                  ],
                              }}
                            />

                            <span>
                              {item.name}
                            </span>

                            <strong>
                              {item.value}
                            </strong>
                          </div>
                        )
                      )}

                    </div>
                  </>
                ) : (
                  <EmptyChart text="No applications yet." />
                )}

              </div>

            </section>

            {/* STUDENTS BY BRANCH */}

            <section className="premium-panel">

              <PanelHeader
                eyebrow="STUDENT DEMOGRAPHICS"
                title="Students by branch"
                subtitle="Registered students across departments"
              />

              <div className="chart-container">

                {branchChartData.length > 0 ? (
                  <ResponsiveContainer
                    width="100%"
                    height={310}
                  >
                    <BarChart
                      data={branchChartData}
                      margin={{
                        left: -20,
                      }}
                    >
                      <CartesianGrid
                        stroke="#eeeeee"
                        vertical={false}
                      />

                      <XAxis
                        dataKey="name"
                        tick={{
                          fill: '#737373',
                          fontSize: 11,
                        }}
                        axisLine={false}
                        tickLine={false}
                      />

                      <YAxis
                        allowDecimals={false}
                        tick={{
                          fill: '#737373',
                          fontSize: 11,
                        }}
                        axisLine={false}
                        tickLine={false}
                      />

                      <Tooltip />

                      <Bar
                        dataKey="students"
                        fill="#111111"
                        radius={[
                          7,
                          7,
                          0,
                          0,
                        ]}
                        barSize={34}
                      />

                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyChart text="No student data yet." />
                )}

              </div>

            </section>

            {/* COMPANY DRIVES */}

            <section className="premium-panel">

              <PanelHeader
                eyebrow="RECRUITMENT ACTIVITY"
                title="Drives by company"
                subtitle="Placement activity across partners"
              />

              <div className="chart-container">

                {companyDriveData.length > 0 ? (
                  <ResponsiveContainer
                    width="100%"
                    height={310}
                  >
                    <BarChart
                      data={companyDriveData}
                      layout="vertical"
                      margin={{
                        left: 20,
                      }}
                    >
                      <CartesianGrid
                        stroke="#eeeeee"
                        horizontal={false}
                      />

                      <XAxis
                        type="number"
                        allowDecimals={false}
                        axisLine={false}
                        tickLine={false}
                      />

                      <YAxis
                        type="category"
                        dataKey="name"
                        width={100}
                        tick={{
                          fill: '#737373',
                          fontSize: 11,
                        }}
                        axisLine={false}
                        tickLine={false}
                      />

                      <Tooltip />

                      <Bar
                        dataKey="drives"
                        fill="#2563eb"
                        radius={[
                          0,
                          7,
                          7,
                          0,
                        ]}
                        barSize={24}
                      />

                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyChart text="No placement drives yet." />
                )}

              </div>

            </section>

          </div>

          {/* QUICK SUMMARY */}

          <section className="premium-panel summary-panel">

            <PanelHeader
              eyebrow="SYSTEM SNAPSHOT"
              title="Placement overview"
              subtitle="A quick read of the current platform state"
            />

            <div className="summary-chart">

              <ResponsiveContainer
                width="100%"
                height={180}
              >
                <AreaChart
                  data={overviewTrendData}
                >
                  <defs>
                    <linearGradient
                      id="summaryGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="#2563eb"
                        stopOpacity={0.2}
                      />

                      <stop
                        offset="100%"
                        stopColor="#2563eb"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>

                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                  />

                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />

                  <Tooltip />

                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#2563eb"
                    strokeWidth={3}
                    fill="url(#summaryGradient)"
                  />

                </AreaChart>
              </ResponsiveContainer>

            </div>

          </section>

        </div>
      )}

      {/* ================= COMPANIES ================= */}

      {tab === 'companies' && (
        <div className="management-layout">

          <section className="premium-panel form-panel">

            <PanelHeader
              eyebrow="COMPANY MANAGEMENT"
              title={
                editingCompanyId
                  ? 'Edit company'
                  : 'Add company'
              }
              subtitle="Create and maintain recruiting partners"
            />

            <form
              onSubmit={
                addOrUpdateCompany
              }
              className="premium-form"
            >

              {[
                'name',
                'industry',
                'location',
                'website',
              ].map((field) => (
                <div
                  className="field"
                  key={field}
                >

                  <label>
                    {field}
                  </label>

                  <input
                    type={
                      field ===
                      'website'
                        ? 'url'
                        : 'text'
                    }
                    value={
                      companyForm[
                        field
                      ]
                    }
                    required={
                      field === 'name'
                    }
                    placeholder={
                      `Enter ${field}`
                    }
                    onChange={(e) =>
                      setCompanyForm({
                        ...companyForm,
                        [field]:
                          e.target.value,
                      })
                    }
                  />

                </div>
              ))}

              <div className="field">

                <label>
                  description
                </label>

                <textarea
                  rows="5"
                  value={
                    companyForm.description
                  }
                  placeholder="Enter company description"
                  onChange={(e) =>
                    setCompanyForm({
                      ...companyForm,
                      description:
                        e.target.value,
                    })
                  }
                />

              </div>

              <div className="form-actions">

                <button
                  type="submit"
                  className="primary-action"
                  disabled={busy}
                >
                  {busy
                    ? 'Saving...'
                    : editingCompanyId
                    ? 'Update company'
                    : 'Create company'}
                </button>

                {editingCompanyId && (
                  <button
                    type="button"
                    className="secondary-action"
                    onClick={() => {
                      setEditingCompanyId(
                        null
                      );

                      setCompanyForm({
                        ...emptyCompany,
                      });
                    }}
                  >
                    Cancel
                  </button>
                )}

              </div>

            </form>

          </section>

          <section className="premium-panel">

            <PanelHeader
              eyebrow="RECRUITING PARTNERS"
              title={`Companies (${companies.length})`}
              subtitle="Organizations available for placement drives"
            />

            <div className="company-list">

              {companies.map(
                (company) => (
                  <div
                    className="company-item"
                    key={company.id}
                  >

                    <div className="company-avatar">
                      {(
                        company.name ||
                        '?'
                      )
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div className="company-info">

                      <strong>
                        {company.name}
                      </strong>

                      <span>
                        {company.industry ||
                          'Industry not specified'}
                        {' · '}
                        {company.location ||
                          'Location not specified'}
                      </span>

                      {company.website && (
                        <small>
                          {company.website}
                        </small>
                      )}

                    </div>

                    <div className="item-actions">

                      <button
                        type="button"
                        className="ghost-button"
                        onClick={() =>
                          editCompany(
                            company
                          )
                        }
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        className="danger-button"
                        onClick={() =>
                          deleteCompany(
                            company.id
                          )
                        }
                      >
                        Delete
                      </button>

                    </div>

                  </div>
                )
              )}

              {!companies.length && (
                <EmptyState text="No companies have been added yet." />
              )}

            </div>

          </section>

        </div>
      )}

      {/* ================= DRIVES ================= */}

      {tab === 'drives' && (
        <div className="management-layout">

          <section className="premium-panel form-panel">

            <PanelHeader
              eyebrow="PLACEMENT DRIVES"
              title={
                editingDriveId
                  ? 'Edit drive'
                  : 'Create drive'
              }
              subtitle="Publish a new opportunity for eligible students"
            />

            <form
              onSubmit={
                addOrUpdateDrive
              }
              className="premium-form"
            >

              <div className="field">

                <label>
                  company
                </label>

                <select
                  value={
                    driveForm.companyId
                  }
                  required
                  onChange={(e) =>
                    setDriveForm({
                      ...driveForm,
                      companyId:
                        e.target.value,
                    })
                  }
                >
                  <option value="">
                    Select company
                  </option>

                  {companies.map(
                    (company) => (
                      <option
                        key={company.id}
                        value={company.id}
                      >
                        {company.name}
                      </option>
                    )
                  )}

                </select>

              </div>

              <div className="field">

                <label>
                  job title
                </label>

                <input
                  value={
                    driveForm.jobTitle
                  }
                  required
                  placeholder="Software Engineer"
                  onChange={(e) =>
                    setDriveForm({
                      ...driveForm,
                      jobTitle:
                        e.target.value,
                    })
                  }
                />

              </div>

              <div className="two-fields">

                <div className="field">

                  <label>
                    drive date
                  </label>

                  <input
                    type="date"
                    min={today}
                    value={
                      driveForm.driveDate
                    }
                    required
                    onChange={(e) =>
                      setDriveForm({
                        ...driveForm,
                        driveDate:
                          e.target.value,
                      })
                    }
                  />

                </div>

                <div className="field">

                  <label>
                    application deadline
                  </label>

                  <input
                    type="date"
                    value={
                      driveForm.applicationDeadline
                    }
                    required
                    onChange={(e) =>
                      setDriveForm({
                        ...driveForm,
                        applicationDeadline:
                          e.target.value,
                      })
                    }
                  />

                </div>

              </div>

              <div className="two-fields">

                <div className="field">

                  <label>
                    minimum CGPA
                  </label>

                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.01"
                    value={
                      driveForm.minimumCgpa
                    }
                    required
                    onChange={(e) =>
                      setDriveForm({
                        ...driveForm,
                        minimumCgpa:
                          e.target.value,
                      })
                    }
                  />

                </div>

                <div className="field">

                  <label>
                    job type
                  </label>

                  <select
                    value={
                      driveForm.jobType
                    }
                    onChange={(e) =>
                      setDriveForm({
                        ...driveForm,
                        jobType:
                          e.target.value,
                      })
                    }
                  >
                    <option>
                      FULL_TIME
                    </option>

                    <option>
                      INTERNSHIP
                    </option>

                    <option>
                      PART_TIME
                    </option>
                  </select>

                </div>

              </div>

              <div className="field">

                <label>
                  salary package
                </label>

                <input
                  value={
                    driveForm.salaryPackage
                  }
                  placeholder="8 LPA"
                  onChange={(e) =>
                    setDriveForm({
                      ...driveForm,
                      salaryPackage:
                        e.target.value,
                    })
                  }
                />

              </div>

              <div className="field">

                <label>
                  job location
                </label>

                <input
                  value={
                    driveForm.jobLocation
                  }
                  placeholder="Hyderabad"
                  onChange={(e) =>
                    setDriveForm({
                      ...driveForm,
                      jobLocation:
                        e.target.value,
                    })
                  }
                />

              </div>

              <div className="field">

                <label>
                  eligible branches
                </label>

                <input
                  value={
                    driveForm.eligibleBranches
                  }
                  placeholder="CSE,ECE,IT"
                  onChange={(e) =>
                    setDriveForm({
                      ...driveForm,
                      eligibleBranches:
                        e.target.value,
                    })
                  }
                />

              </div>

              <div className="field">

                <label>
                  required skills
                </label>

                <input
                  value={
                    driveForm.requiredSkills
                  }
                  placeholder="Java, SQL, Spring Boot"
                  onChange={(e) =>
                    setDriveForm({
                      ...driveForm,
                      requiredSkills:
                        e.target.value,
                    })
                  }
                />

              </div>

              <div className="field">

                <label>
                  job description
                </label>

                <textarea
                  rows="5"
                  value={
                    driveForm.jobDescription
                  }
                  placeholder="Describe the role..."
                  onChange={(e) =>
                    setDriveForm({
                      ...driveForm,
                      jobDescription:
                        e.target.value,
                    })
                  }
                />

              </div>

              <label className="toggle-row">

                <input
                  type="checkbox"
                  checked={
                    driveForm.active
                  }
                  onChange={(e) =>
                    setDriveForm({
                      ...driveForm,
                      active:
                        e.target.checked,
                    })
                  }
                />

                <span>
                  Active placement drive
                </span>

              </label>

              <div className="form-actions">

                <button
                  type="submit"
                  className="primary-action"
                  disabled={busy}
                >
                  {busy
                    ? 'Saving...'
                    : editingDriveId
                    ? 'Update drive'
                    : 'Create drive'}
                </button>

                {editingDriveId && (
                  <button
                    type="button"
                    className="secondary-action"
                    onClick={() => {
                      setEditingDriveId(
                        null
                      );

                      setDriveForm({
                        ...emptyDrive,
                      });
                    }}
                  >
                    Cancel
                  </button>
                )}

              </div>

            </form>

          </section>

          <section className="premium-panel">

            <PanelHeader
              eyebrow="OPEN OPPORTUNITIES"
              title={`Placement drives (${drives.length})`}
              subtitle="Manage recruiting opportunities and applicants"
            />

            <div className="drive-list">

              {drives.map((drive) => (
                <article
                  className="drive-card"
                  key={drive.id}
                >

                  <div className="drive-company">
                    {drive.company?.name ||
                      'Unknown company'}
                  </div>

                  <h3>
                    {drive.jobTitle}
                  </h3>

                  <div className="drive-meta">

                    <span>
                      {drive.jobLocation ||
                        'Location not set'}
                    </span>

                    <span>
                      CGPA {drive.minimumCgpa}
                    </span>

                    <span>
                      Deadline{' '}
                      {drive.applicationDeadline}
                    </span>

                  </div>

                  <div className="drive-footer">

                    <span
                      className={
                        drive.active
                          ? 'status active'
                          : 'status inactive'
                      }
                    >
                      <i />
                      {drive.active
                        ? 'Active'
                        : 'Inactive'}
                    </span>

                    <div className="item-actions">

                      <button
                        type="button"
                        className="ghost-button"
                        onClick={() =>
                          editDrive(
                            drive
                          )
                        }
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        className="ghost-button"
                        onClick={() =>
                          viewApplicants(
                            drive
                          )
                        }
                      >
                        Applicants
                      </button>

                      <button
                        type="button"
                        className="danger-button"
                        onClick={() =>
                          deleteDrive(
                            drive.id
                          )
                        }
                      >
                        Delete
                      </button>

                    </div>

                  </div>

                </article>
              ))}

              {!drives.length && (
                <EmptyState text="No placement drives have been created yet." />
              )}

            </div>

          </section>

        </div>
      )}

      {/* ================= STUDENTS ================= */}

      {tab === 'students' && (
        <section className="premium-panel">

          <PanelHeader
            eyebrow="STUDENT DIRECTORY"
            title={`Registered students (${students.length})`}
            subtitle="Candidate profiles currently registered in the system"
          />

          <div className="premium-table-wrap">

            <table className="premium-table">

              <thead>
                <tr>
                  <th>Name</th>
                  <th>Roll number</th>
                  <th>Branch</th>
                  <th>Year</th>
                  <th>CGPA</th>
                  <th>Skills</th>
                </tr>
              </thead>

              <tbody>

                {students.map(
                  (student) => (
                    <tr
                      key={student.id}
                    >
                      <td>
                        <strong>
                          {student.fullName}
                        </strong>
                      </td>

                      <td>
                        {student.rollNumber}
                      </td>

                      <td>
                        <span className="soft-badge">
                          {student.branch}
                        </span>
                      </td>

                      <td>
                        Year {student.year}
                      </td>

                      <td>
                        <strong>
                          {student.cgpa}
                        </strong>
                      </td>

                      <td>
                        {student.skills?.length
                          ? student.skills.join(
                              ', '
                            )
                          : '—'}
                      </td>
                    </tr>
                  )
                )}

              </tbody>

            </table>

            {!students.length && (
              <EmptyState text="No students registered yet." />
            )}

          </div>

        </section>
      )}

      {/* ================= APPLICATIONS ================= */}

      {tab === 'applications' && (
        <section className="premium-panel">

          <PanelHeader
            eyebrow="APPLICATION REVIEW"
            title={
              selectedDrive
                ? `Applicants — ${selectedDrive.jobTitle}`
                : 'Application management'
            }
            subtitle={
              selectedDrive
                ? `Review candidates for ${selectedDrive.company?.name || 'this drive'}`
                : 'Select a placement drive to review applicants'
            }
          />

          {!selectedDrive ? (

            <div className="application-empty">

              <div className="empty-icon">
                →
              </div>

              <h3>
                Select a placement drive
              </h3>

              <p>
                Go to Placement Drives
                and select Applicants
                for the drive you want
                to review.
              </p>

              <button
                type="button"
                className="primary-action"
                onClick={() =>
                  setTab('drives')
                }
              >
                View placement drives
              </button>

            </div>

          ) : (

            <div className="premium-table-wrap">

              <div className="application-toolbar">

                <button
                  type="button"
                  className="secondary-action"
                  onClick={() => {
                    setSelectedDrive(
                      null
                    );
                    setApplicants([]);
                  }}
                >
                  ← Back
                </button>

                <span>
                  {applicants.length}{' '}
                  applicant
                  {applicants.length !==
                  1
                    ? 's'
                    : ''}
                </span>

              </div>

              <table className="premium-table">

                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Roll</th>
                    <th>CGPA</th>
                    <th>Applied</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>

                  {applicants.map(
                    (application) => (
                      <tr
                        key={
                          application.id
                        }
                      >

                        <td>
                          <strong>
                            {
                              application
                                .student
                                ?.fullName
                            }
                          </strong>

                          <small className="table-sub">
                            {
                              application
                                .student
                                ?.email
                            }
                          </small>
                        </td>

                        <td>
                          {
                            application
                              .student
                              ?.rollNumber
                          }
                        </td>

                        <td>
                          {
                            application
                              .student
                              ?.cgpa
                          }
                        </td>

                        <td>
                          {
                            application.appliedDate
                          }
                        </td>

                        <td>

                          <select
                            className="status-select"
                            value={
                              application.status
                            }
                            onChange={(e) =>
                              changeStatus(
                                application.id,
                                e.target.value
                              )
                            }
                          >
                            {statuses.map(
                              (status) => (
                                <option
                                  key={
                                    status
                                  }
                                >
                                  {status}
                                </option>
                              )
                            )}
                          </select>

                        </td>

                      </tr>
                    )
                  )}

                </tbody>

              </table>

              {!applicants.length && (
                <EmptyState text="No students have applied to this drive yet." />
              )}

            </div>

          )}

        </section>
      )}

    </Layout>
  );
}


/* =========================================================
   SMALL COMPONENTS
========================================================= */

function Metric({
  label,
  value,
  detail,
  index,
}) {
  return (
    <div className="metric-card">

      <div className="metric-top">
        <span>
          {index}
        </span>

        <div className="metric-dot" />
      </div>

      <div className="metric-value">
        {value ?? 0}
      </div>

      <div className="metric-label">
        {label}
      </div>

      <div className="metric-detail">
        {detail}
      </div>

    </div>
  );
}


function PanelHeader({
  eyebrow,
  title,
  subtitle,
}) {
  return (
    <div className="panel-header">

      <div>

        <div className="panel-eyebrow">
          {eyebrow}
        </div>

        <h2>
          {title}
        </h2>

        <p>
          {subtitle}
        </p>

      </div>

    </div>
  );
}


function EmptyChart({ text }) {
  return (
    <div className="empty-chart">
      {text}
    </div>
  );
}


function EmptyState({ text }) {
  return (
    <div className="empty-state">

      <div className="empty-state-line" />

      <p>
        {text}
      </p>

    </div>
  );
}