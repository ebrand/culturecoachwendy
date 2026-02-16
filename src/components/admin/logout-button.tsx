'use client';

import { LogOut } from 'lucide-react';

export function LogoutButton() {
  return (
    <form action="/api/admin/auth/logout" method="POST">
      <button
        type="submit"
        className="flex items-center gap-3 px-3 py-2 w-full rounded-md text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors text-sm"
      >
        <LogOut className="w-4 h-4" />
        Sign out
      </button>
    </form>
  );
}
