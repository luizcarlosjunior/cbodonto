// src/app/admin/(protected)/layout.tsx
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminProviders from '@/components/admin/AdminProviders'

export const metadata = { title: 'Admin – CB Odonto' }

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/admin/login')

  return (
    <AdminProviders session={session}>
      <div className="flex min-h-screen bg-stone-100">
        <AdminSidebar user={session.user} />
        <main className="flex-1 min-w-0 overflow-auto">
          {children}
        </main>
      </div>
    </AdminProviders>
  )
}
