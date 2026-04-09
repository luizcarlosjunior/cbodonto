// src/app/admin/(auth)/layout.tsx
import AdminProviders from '@/components/admin/AdminProviders'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminProviders session={null as any}>
      {children}
    </AdminProviders>
  )
}
