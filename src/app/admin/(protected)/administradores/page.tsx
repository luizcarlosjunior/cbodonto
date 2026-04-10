'use client'
// src/app/admin/(protected)/administradores/page.tsx
import { useState, useEffect, useRef, useCallback } from 'react'
import { Plus, Pencil, Trash2, KeyRound, ShieldCheck, Shield } from 'lucide-react'
import { cn, formatDate } from '@/lib/utils'

interface AdminUser {
  id: string
  name: string
  email: string
  role: 'SUPER_ADMIN' | 'ADMIN'
  createdAt: string
}

// ─── Delete modal ─────────────────────────────────────────────────────────────
function DeleteModal({ user, onConfirm, onClose }: { user: AdminUser; onConfirm: () => void; onClose: () => void }) {
  const [countdown, setCountdown] = useState(3)
  const timer = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    timer.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) { clearInterval(timer.current!); return 0 }
        return c - 1
      })
    }, 1000)
    return () => clearInterval(timer.current!)
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white border border-stone-200 p-6 w-full max-w-sm shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <Trash2 size={18} className="text-red-500" />
          <h3 className="font-serif text-lg text-stone-900">Excluir Administrador</h3>
        </div>
        <p className="text-sm text-stone-600 mb-6">
          Tem certeza que deseja excluir <strong>{user.name}</strong>? Esta ação não pode ser desfeita.
        </p>
        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="btn-secondary">Cancelar</button>
          <button
            onClick={onConfirm}
            disabled={countdown > 0}
            className={cn(
              'btn-primary !bg-red-600 hover:!bg-red-700 border-red-600 gap-2 min-w-[120px] justify-center',
              countdown > 0 && 'opacity-60 cursor-not-allowed'
            )}
          >
            <Trash2 size={13} />
            {countdown > 0 ? `Aguarde ${countdown}s` : 'Excluir'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Edit/Create modal ────────────────────────────────────────────────────────
function UserModal({
  user,
  onClose,
  onSave,
}: {
  user: AdminUser | null
  onClose: () => void
  onSave: () => void
}) {
  const isNew = !user
  const [form, setForm] = useState({
    name: user?.name ?? '',
    email: user?.email ?? '',
    role: user?.role ?? 'ADMIN' as 'ADMIN' | 'SUPER_ADMIN',
    password: '',
    confirmPassword: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (isNew) {
      if (!form.password) { setError('Senha obrigatória'); return }
      if (form.password !== form.confirmPassword) { setError('Senhas não conferem'); return }
      if (form.password.length < 6) { setError('Senha deve ter pelo menos 6 caracteres'); return }
    }

    setSaving(true)
    try {
      const body = isNew
        ? { name: form.name, email: form.email, role: form.role, password: form.password }
        : { name: form.name, email: form.email, role: form.role }

      const res = await fetch(
        isNew ? '/api/admin/users' : `/api/admin/users/${user!.id}`,
        {
          method: isNew ? 'POST' : 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        }
      )
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Erro ao salvar'); setSaving(false); return }
      onSave()
    } catch {
      setError('Erro ao salvar')
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white border border-stone-200 p-6 w-full max-w-md shadow-xl">
        <h3 className="font-serif text-lg text-stone-900 mb-5">
          {isNew ? 'Novo Administrador' : 'Editar Administrador'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[0.65rem] text-stone-400 block mb-1">Nome *</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:border-burgundy"
            />
          </div>
          <div>
            <label className="text-[0.65rem] text-stone-400 block mb-1">E-mail *</label>
            <input
              required
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className="w-full border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:border-burgundy"
            />
          </div>
          <div>
            <label className="text-[0.65rem] text-stone-400 block mb-1">Perfil</label>
            <select
              value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as any }))}
              className="w-full border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:border-burgundy bg-white"
            >
              <option value="ADMIN">Admin</option>
              <option value="SUPER_ADMIN">Super Admin</option>
            </select>
          </div>
          {isNew && (
            <>
              <div>
                <label className="text-[0.65rem] text-stone-400 block mb-1">Senha *</label>
                <input
                  required
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  className="w-full border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:border-burgundy"
                />
              </div>
              <div>
                <label className="text-[0.65rem] text-stone-400 block mb-1">Confirmar Senha *</label>
                <input
                  required
                  type="password"
                  value={form.confirmPassword}
                  onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))}
                  className="w-full border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:border-burgundy"
                />
              </div>
            </>
          )}
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">Cancelar</button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Password modal ───────────────────────────────────────────────────────────
function PasswordModal({ user, onClose, onSave }: { user: AdminUser; onClose: () => void; onSave: () => void }) {
  const [form, setForm] = useState({ password: '', confirmPassword: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (form.password.length < 6) { setError('Senha deve ter pelo menos 6 caracteres'); return }
    if (form.password !== form.confirmPassword) { setError('Senhas não conferem'); return }

    setSaving(true)
    const res = await fetch(`/api/admin/users/${user.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: form.password }),
    })
    const data = await res.json()
    setSaving(false)
    if (!res.ok) { setError(data.error ?? 'Erro ao salvar'); return }
    onSave()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white border border-stone-200 p-6 w-full max-w-sm shadow-xl">
        <div className="flex items-center gap-3 mb-5">
          <KeyRound size={16} className="text-burgundy" />
          <h3 className="font-serif text-lg text-stone-900">Alterar Senha</h3>
        </div>
        <p className="text-sm text-stone-500 mb-4">Alterando senha de <strong>{user.name}</strong>.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[0.65rem] text-stone-400 block mb-1">Nova Senha *</label>
            <input
              required
              type="password"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              className="w-full border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:border-burgundy"
            />
          </div>
          <div>
            <label className="text-[0.65rem] text-stone-400 block mb-1">Confirmar Senha *</label>
            <input
              required
              type="password"
              value={form.confirmPassword}
              onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))}
              className="w-full border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:border-burgundy"
            />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">Cancelar</button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Salvando...' : 'Alterar Senha'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function AdministradoresPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [editOpen, setEditOpen] = useState(false)
  const [editUser, setEditUser] = useState<AdminUser | null>(null) // null = new
  const [passwordUser, setPasswordUser] = useState<AdminUser | null>(null)
  const [deleteUser, setDeleteUser] = useState<AdminUser | null>(null)
  const [msg, setMsg] = useState('')

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/admin/users')
    if (res.ok) {
      const data = await res.json()
      setUsers(data.users ?? [])
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  const showMsg = (text: string) => {
    setMsg(text)
    setTimeout(() => setMsg(''), 3000)
  }

  const handleDelete = async () => {
    if (!deleteUser) return
    const res = await fetch(`/api/admin/users/${deleteUser.id}`, { method: 'DELETE' })
    const data = await res.json()
    setDeleteUser(null)
    if (!res.ok) { showMsg(data.error ?? 'Erro ao excluir'); return }
    showMsg('Administrador excluído.')
    fetchUsers()
  }

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-3xl text-stone-900">Administradores</h1>
          <p className="text-stone-400 text-sm mt-0.5">Gerencie os usuários com acesso ao painel.</p>
        </div>
        <button onClick={() => { setEditUser(null); setEditOpen(true) }} className="btn-primary gap-2">
          <Plus size={14} />
          Novo Admin
        </button>
      </div>

      {msg && (
        <div className="mb-4 px-4 py-2.5 text-sm border rounded-sm bg-emerald-50 border-emerald-200 text-emerald-700">
          {msg}
        </div>
      )}

      <div className="bg-white border border-stone-200">
        {loading ? (
          <div className="p-8 space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-14 bg-stone-100 rounded animate-pulse" />
            ))}
          </div>
        ) : users.length === 0 ? (
          <p className="text-stone-400 text-sm text-center py-12">Nenhum administrador encontrado.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-100 bg-stone-50 text-stone-400 text-[0.65rem] uppercase tracking-wider">
                <th className="px-4 py-3 text-left font-medium">Nome</th>
                <th className="px-4 py-3 text-left font-medium">E-mail</th>
                <th className="px-4 py-3 text-left font-medium">Perfil</th>
                <th className="px-4 py-3 text-left font-medium">Criado em</th>
                <th className="px-4 py-3 text-right font-medium">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-stone-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-stone-900">{u.name}</td>
                  <td className="px-4 py-3 text-stone-500">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      'inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-[0.65rem] font-medium',
                      u.role === 'SUPER_ADMIN'
                        ? 'bg-burgundy/10 text-burgundy'
                        : 'bg-stone-100 text-stone-600'
                    )}>
                      {u.role === 'SUPER_ADMIN'
                        ? <><ShieldCheck size={10} /> Super Admin</>
                        : <><Shield size={10} /> Admin</>
                      }
                    </span>
                  </td>
                  <td className="px-4 py-3 text-stone-400 text-xs">{formatDate(u.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setPasswordUser(u)}
                        title="Alterar senha"
                        className="p-1.5 text-stone-400 hover:text-burgundy hover:bg-stone-100 rounded-sm transition-colors"
                      >
                        <KeyRound size={14} />
                      </button>
                      <button
                        onClick={() => { setEditUser(u); setEditOpen(true) }}
                        title="Editar"
                        className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-sm transition-colors"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => setDeleteUser(u)}
                        title="Excluir"
                        className="p-1.5 text-stone-400 hover:text-red-500 hover:bg-stone-100 rounded-sm transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modals */}
      {editOpen && (
        <UserModal
          user={editUser}
          onClose={() => setEditOpen(false)}
          onSave={() => { setEditOpen(false); fetchUsers(); showMsg('Administrador salvo com sucesso!') }}
        />
      )}
      {passwordUser && (
        <PasswordModal
          user={passwordUser}
          onClose={() => setPasswordUser(null)}
          onSave={() => { setPasswordUser(null); showMsg('Senha alterada com sucesso!') }}
        />
      )}
      {deleteUser && (
        <DeleteModal
          user={deleteUser}
          onClose={() => setDeleteUser(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  )
}
