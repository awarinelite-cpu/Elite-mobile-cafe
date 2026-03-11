import React from 'react';

export const STATUS_LABELS = {
  submitted:               'Submitted',
  negotiating:             'Negotiating',
  advance_due:             'Advance Due',
  in_progress:             'In Progress',
  awaiting_final_payment:  'Balance Due',
  completed:               'Completed',
  cancelled:               'Cancelled',
};

export const STATUS_STEPS = [
  { key: 'submitted',              label: 'Submitted' },
  { key: 'negotiating',            label: 'Negotiating' },
  { key: 'advance_due',            label: 'Advance Due' },
  { key: 'in_progress',            label: 'In Progress' },
  { key: 'awaiting_final_payment', label: 'Balance Due' },
  { key: 'completed',              label: 'Completed' },
];

export function StatusBadge({ status }) {
  return (
    <span className={`badge badge-${status}`}>
      {STATUS_LABELS[status] || status}
    </span>
  );
}

export function StatusProgress({ status }) {
  const currentIdx = STATUS_STEPS.findIndex(s => s.key === status);
  return (
    <div className="status-steps">
      {STATUS_STEPS.map((step, i) => (
        <React.Fragment key={step.key}>
          <div className={`status-step ${i < currentIdx ? 'done' : i === currentIdx ? 'active' : ''}`}>
            <div className="status-step-dot">{i < currentIdx ? '✓' : i + 1}</div>
            <span className="status-step-label">{step.label}</span>
          </div>
          {i < STATUS_STEPS.length - 1 && (
            <div className={`status-step-line ${i < currentIdx ? 'done' : ''}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

export const CATEGORIES = [
  'Academic / University',
  'Professional / Corporate',
  'Medical / Health Sciences',
  'General',
  'Law & Legal Studies',
  'Business & Finance',
  'Science & Technology',
  'Social Sciences',
  'Humanities & Arts',
];

export const ACADEMIC_LEVELS = [
  'High School',
  'Undergraduate',
  'Postgraduate',
  'PhD / Doctoral',
  'Professional',
];

export function formatCurrency(amount, currency = 'NGN') {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency }).format(amount);
}

export function timeAgo(timestamp) {
  if (!timestamp) return '';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}
