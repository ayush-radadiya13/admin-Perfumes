'use client';

import { useAuth } from '../../components/AuthProvider';

export default function SettingsPage() {
  const { admin } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-admin-text">Settings</h1>
        <p className="mt-1 text-sm text-admin-muted">Account and panel preferences.</p>
      </div>
      <div className="admin-card max-w-lg p-6 shadow-admin">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-admin-muted">Profile</h2>
        <dl className="mt-4 space-y-3 text-sm">
          <div>
            <dt className="text-admin-muted">Email</dt>
            <dd className="mt-0.5 font-medium text-admin-text">{admin?.email ?? '—'}</dd>
          </div>
        </dl>
        <p className="mt-6 text-xs text-admin-muted">
          JWT session is stored in the browser. Use Logout from the header to end your session.
        </p>
      </div>
    </div>
  );
}
