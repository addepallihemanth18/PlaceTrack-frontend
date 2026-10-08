
import React from 'react';

export default function StatCard({
  label,
  value,
  color = 'primary'
}) {
  return (
    <div className="col-md">
      <div className={`card stat border-start border-4 border-${color}`}>
        <div className="card-body">
          <small className="text-muted">
            {label}
          </small>

          <h2>
            {value ?? 0}
          </h2>
        </div>
      </div>
    </div>
  );
}

