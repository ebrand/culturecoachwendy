import Link from 'next/link';
import Image from 'next/image';
import { LayoutDashboard, FileQuestion, Users, UserCircle } from 'lucide-react';
import { requireAdminPage } from '@/lib/auth/admin-page';
import { LogoutButton } from '@/components/admin/logout-button';

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const response = await requireAdminPage();

  const user = response.user;
  const email = user.emails?.[0]?.email ?? '';
  const firstName = user.name?.first_name ?? '';
  const lastName = user.name?.last_name ?? '';
  const displayName = [firstName, lastName].filter(Boolean).join(' ');
  const googleProvider = user.providers?.find(
    (p) => p.provider_type.toLowerCase() === 'google'
  );
  const profilePicture = googleProvider?.profile_picture_url ?? null;

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 text-white flex flex-col" style={{ backgroundColor: '#c9952d' }}>
        <div className="p-4 border-b border-white/20">
          <h1 className="text-xl font-bold">Culture Coach Wendy</h1>
        </div>
        <nav className="p-4 flex-1">
          <ul className="space-y-2">
            <li>
              <Link
                href="/admin"
                className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-white/20 transition-colors"
              >
                <LayoutDashboard className="w-5 h-5" />
                Dashboard
              </Link>
            </li>
            <li>
              <Link
                href="/admin/quizzes"
                className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-white/20 transition-colors"
              >
                <FileQuestion className="w-5 h-5" />
                Quizzes
              </Link>
            </li>
            <li>
              <Link
                href="/admin/leads"
                className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-white/20 transition-colors"
              >
                <Users className="w-5 h-5" />
                Leads
              </Link>
            </li>
            <li>
              <Link
                href="/admin/account"
                className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-white/20 transition-colors"
              >
                <UserCircle className="w-5 h-5" />
                Account
              </Link>
            </li>
          </ul>
        </nav>
        <div className="p-4 border-t border-white/20 space-y-3">
          <Link
            href="/admin/account"
            className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-white/20 transition-colors"
          >
            {profilePicture ? (
              <Image
                src={profilePicture}
                alt={displayName || email}
                width={32}
                height={32}
                className="rounded-full shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-semibold shrink-0">
                {(firstName?.[0] || email[0] || '?').toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              {displayName && (
                <p className="text-sm font-medium truncate">{displayName}</p>
              )}
              <p className="text-xs text-white/70 truncate">{email}</p>
            </div>
          </Link>
          <LogoutButton />
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 bg-neutral-50">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
