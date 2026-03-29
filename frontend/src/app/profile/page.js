'use client';

import AppShell from '@/components/AppShell';

/**
 * /profile opens the profile popup (see AppShell) and keeps the shell (navbar, nav).
 * Closing the modal sends the user to the dashboard.
 */
export default function ProfilePage() {
  return (
    <AppShell>
      <div className="min-h-[30vh]" />
    </AppShell>
  );
}
