import { unstable_cache } from 'next/cache'
import { db } from './db'

import { TAGS } from './cache-tags'
export { TAGS, ALL_TAGS } from './cache-tags'

// ─── Site (public) ───────────────────────────────────────────────────────────

export const getCachedDentists = unstable_cache(
  () =>
    db.dentist.findMany({
      where: { active: true },
      include: { weeklySchedule: { where: { active: true } } },
    }),
  [TAGS.dentists],
  { tags: [TAGS.dentists] },
)

export const getCachedTestimonials = unstable_cache(
  async () => {
    const all = await db.testimonial.findMany({ where: { approved: true } })
    // shuffle so each cache miss (revalidation) produces a different order
    for (let i = all.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[all[i], all[j]] = [all[j], all[i]]
    }
    return all
  },
  [TAGS.testimonials],
  { tags: [TAGS.testimonials] },
)

// ─── Admin – dentistas ────────────────────────────────────────────────────────

export const getCachedAdminDentists = unstable_cache(
  () =>
    db.dentist.findMany({
      include: { weeklySchedule: true, _count: { select: { appointments: true } } },
      orderBy: { name: 'asc' },
    }),
  ['admin-dentists'],
  { tags: [TAGS.dentists] },
)

export function getCachedAdminDentist(id: string) {
  return unstable_cache(
    () =>
      db.dentist.findUnique({
        where: { id },
        include: {
          weeklySchedule: { orderBy: { dayOfWeek: 'asc' } },
          unavailableDates: { orderBy: { date: 'asc' } },
          _count: { select: { appointments: true } },
        },
      }),
    [`admin-dentist-${id}`],
    { tags: [TAGS.dentists] },
  )()
}

// ─── Site (public) – serviços ─────────────────────────────────────────────────

export const getCachedServices = unstable_cache(
  () =>
    db.service.findMany({
      where: { active: true },
      orderBy: { position: 'asc' },
      include: {
        images: { where: { active: true }, orderBy: { position: 'asc' } },
      },
    }),
  [TAGS.services],
  { tags: [TAGS.services] },
)

// ─── Admin – serviços ─────────────────────────────────────────────────────────

export const getCachedAdminServices = unstable_cache(
  () =>
    db.service.findMany({
      orderBy: { position: 'asc' },
      include: { images: { orderBy: { position: 'asc' } } },
    }),
  ['admin-services'],
  { tags: [TAGS.services] },
)

// ─── Admin – depoimentos ──────────────────────────────────────────────────────

export const getCachedAdminTestimonials = unstable_cache(
  () => db.testimonial.findMany({ orderBy: { createdAt: 'desc' } }),
  ['admin-testimonials'],
  { tags: [TAGS.testimonials] },
)

// ─── Admin – agendamentos ─────────────────────────────────────────────────────

interface AppointmentParams {
  status?: string
  dentistId?: string
  dateFrom?: string
  dateTo?: string
  page: number
}

export function getCachedAppointments(params: AppointmentParams) {
  const key = `appointments-${JSON.stringify(params)}`
  return unstable_cache(
    () => {
      const limit = 25
      const where: any = {}
      if (params.status) where.status = params.status
      if (params.dentistId) where.dentistId = params.dentistId
      if (params.dateFrom || params.dateTo) {
        where.date = {}
        if (params.dateFrom) where.date.gte = new Date(params.dateFrom)
        if (params.dateTo) where.date.lte = new Date(params.dateTo)
      }
      return Promise.all([
        db.appointment.findMany({
          where,
          include: {
            dentist: { select: { name: true } },
            patient: { select: { name: true, phone: true } },
          },
          orderBy: [{ date: 'desc' }, { startTime: 'asc' }],
          skip: (params.page - 1) * limit,
          take: limit,
        }),
        db.appointment.count({ where }),
      ])
    },
    [key],
    { tags: [TAGS.appointments] },
  )()
}

// ─── Admin – pacientes ────────────────────────────────────────────────────────

interface PatientParams {
  search?: string
  page: number
}

export function getCachedPatients(params: PatientParams) {
  const key = `patients-${JSON.stringify(params)}`
  return unstable_cache(
    () => {
      const limit = 20
      const where = params.search
        ? {
            OR: [
              { name: { contains: params.search, mode: 'insensitive' as const } },
              { phone: { contains: params.search } },
              { email: { contains: params.search, mode: 'insensitive' as const } },
              { cpf: { contains: params.search } },
            ],
          }
        : {}
      return Promise.all([
        db.patient.findMany({
          where,
          include: { _count: { select: { appointments: true } } },
          orderBy: { name: 'asc' },
          skip: (params.page - 1) * limit,
          take: limit,
        }),
        db.patient.count({ where }),
      ])
    },
    [key],
    { tags: [TAGS.patients] },
  )()
}

export function getCachedPatient(id: string) {
  return unstable_cache(
    () =>
      db.patient.findUnique({
        where: { id },
        include: {
          appointments: {
            include: { dentist: { select: { name: true } } },
            orderBy: { date: 'desc' },
            take: 20,
          },
        },
      }),
    [`patient-${id}`],
    { tags: [TAGS.patients] },
  )()
}

// ─── Admin – stats ────────────────────────────────────────────────────────────

export const getCachedStats = unstable_cache(
  () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)
    const weekEnd = new Date(today)
    weekEnd.setDate(today.getDate() + 7)
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)

    return Promise.all([
      db.patient.count(),
      db.appointment.count(),
      db.appointment.count({ where: { date: { gte: today, lt: tomorrow } } }),
      db.appointment.count({ where: { date: { gte: today, lt: weekEnd } } }),
      db.appointment.count({ where: { status: 'PENDING' } }),
      db.testimonial.count({ where: { approved: false } }),
      db.appointment.findMany({
        take: 8,
        orderBy: [{ date: 'desc' }, { startTime: 'asc' }],
        include: {
          dentist: { select: { name: true } },
          patient: { select: { name: true } },
        },
      }),
      db.appointment.count({ where: { status: 'COMPLETED', date: { gte: monthStart } } }),
    ])
  },
  ['stats'],
  { tags: [TAGS.stats, TAGS.appointments, TAGS.patients, TAGS.testimonials], revalidate: 300 },
)

// ─── Site settings ────────────────────────────────────────────────────────────

const SETTINGS_DEFAULTS = {
  whatsappNumber: '5541997234253',
  address: '',
  openHours: '',
  instagramUrl: null as string | null,
  facebookUrl: null as string | null,
}

export const getCachedSiteSettings = unstable_cache(
  async () => {
    const settings = await db.siteSettings.findFirst()
    return settings ?? SETTINGS_DEFAULTS
  },
  ['site-settings'],
  { tags: [TAGS.settings] },
)
