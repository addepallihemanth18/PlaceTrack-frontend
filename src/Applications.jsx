
import React from 'react';

const colors = {
  APPLIED: 'secondary',
  SHORTLISTED: 'primary',
  INTERVIEW: 'warning',
  SELECTED: 'success',
  REJECTED: 'danger'
};

export default function Applications({ applications }) {
  return (
    <section className="card">
      <div className="card-body">

        <h4>My applications</h4>

        <div className="table-responsive">
          <table className="table align-middle">

            <thead>
              <tr>
                <th>Company</th>
                <th>Job</th>
                <th>Applied</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {applications.map((application) => (
                <tr key={application.id}>

                  <td>
                    {application.drive.company.name}
                  </td>

                  <td>
                    {application.drive.jobTitle}
                  </td>

                  <td>
                    {application.appliedDate}
                  </td>

                  <td>
                    <span
                      className={`badge text-bg-${
                        colors[application.status] || 'secondary'
                      }`}
                    >
                      {application.status}
                    </span>
                  </td>

                </tr>
              ))}

              {!applications.length && (
                <tr>
                  <td
                    colSpan="4"
                    className="text-muted"
                  >
                    No applications yet.
                  </td>
                </tr>
              )}
            </tbody>

          </table>
        </div>

      </div>
    </section>
  );
}

