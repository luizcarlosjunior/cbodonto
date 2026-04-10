// src/app/(site)/layout.tsx
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto relative shadow-[0_0_80px_rgba(0,0,0,0.08)]">
      {children}
    </div>
  )
}
