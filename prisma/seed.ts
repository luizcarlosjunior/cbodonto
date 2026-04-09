import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import { AppointmentSource, AppointmentStatus, PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import 'dotenv/config'

const urlString = process.env.DATABASE_URL
const url = new URL(urlString!)
const config = {
  host: url.hostname,
  port: parseInt(url.port) || 3306,
  user: url.username,
  password: decodeURIComponent(url.password),
  database: url.pathname.substring(1),
}
const adapter = new PrismaMariaDb(config)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Seeding database...')

  // ── Admin User ──────────────────────────────────────────────────────────────
  const hashedPassword = await bcrypt.hash('cbodonto@2025', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@cbodonto.com.br' },
    update: {},
    create: {
      email: 'admin@cbodonto.com.br',
      password: hashedPassword,
      name: 'Administrador CB Odonto',
      role: 'SUPER_ADMIN',
    },
  })
  console.log('✅ Admin user:', admin.email)

  // ── Dentists ────────────────────────────────────────────────────────────────
  const samara = await prisma.dentist.upsert({
    where: { id: 'dentist-samara' },
    update: {},
    create: {
      id: 'dentist-samara',
      name: 'Dra. Samara Z. Barcellos',
      title: 'Cirurgiã-Dentista',
      specialty: 'Dentística, Harmonização Orofacial',
      cro: 'CRO-PR 12345',
      bio: 'Especialista em Dentística e Harmonização Orofacial. Conhecida pela atenção cuidadosa e mãos precisas.',
      active: true,
    },
  })

  const samuel = await prisma.dentist.upsert({
    where: { id: 'dentist-samuel' },
    update: {},
    create: {
      id: 'dentist-samuel',
      name: 'Dr. Samuel Campozano',
      title: 'Cirurgião-Dentista',
      specialty: 'Clínica Geral, Cirurgia Oral',
      cro: 'CRO-PR 67890',
      bio: 'Especialista em Clínica Geral e Cirurgia Oral. Dedicado ao atendimento humanizado e à saúde integral dos pacientes.',
      active: true,
    },
  })
  console.log('✅ Dentists:', samara.name, '&', samuel.name)

  // ── Weekly Schedules ────────────────────────────────────────────────────────
  for (const day of [1, 2, 3, 4, 5]) {
    await prisma.weeklySchedule.upsert({
      where: { dentistId_dayOfWeek: { dentistId: samara.id, dayOfWeek: day } },
      update: {},
      create: { dentistId: samara.id, dayOfWeek: day, startTime: '08:00', endTime: '18:00' },
    })
  }

  for (const day of [1, 2, 3, 4, 5]) {
    await prisma.weeklySchedule.upsert({
      where: { dentistId_dayOfWeek: { dentistId: samuel.id, dayOfWeek: day } },
      update: {},
      create: { dentistId: samuel.id, dayOfWeek: day, startTime: '08:00', endTime: '17:00' },
    })
  }
  await prisma.weeklySchedule.upsert({
    where: { dentistId_dayOfWeek: { dentistId: samuel.id, dayOfWeek: 6 } },
    update: {},
    create: { dentistId: samuel.id, dayOfWeek: 6, startTime: '08:00', endTime: '12:00' },
  })
  console.log('✅ Weekly schedules created')

  // ── Unavailable Dates ───────────────────────────────────────────────────────
  const today = new Date()

  const nextWeek = new Date(today)
  nextWeek.setDate(today.getDate() + 7)
  nextWeek.setHours(0, 0, 0, 0)
  await prisma.unavailableDate.create({
    data: { dentistId: samara.id, date: nextWeek, reason: 'Congresso de Odontologia' },
  }).catch(() => {})

  const dayAfterTomorrow = new Date(today)
  dayAfterTomorrow.setDate(today.getDate() + 2)
  dayAfterTomorrow.setHours(0, 0, 0, 0)
  await prisma.unavailableDate.create({
    data: { dentistId: samuel.id, date: dayAfterTomorrow, startTime: '14:00', endTime: '18:00', reason: 'Consulta particular' },
  }).catch(() => {})
  console.log('✅ Unavailable dates created')

  // ── Patients ────────────────────────────────────────────────────────────────
  // CPFs abaixo são fictícios, usados apenas para seed de desenvolvimento.
  const patients = [
    {
      name: 'Sarah Camargo',
      email: 'sarah.camargo@email.com',
      phone: '41991234567',
      cpf: '52998224725',          // CPF fictício válido no algoritmo
      birthDate: new Date('1992-03-15'),
      cep: '83409070',
      logradouro: 'Rua Casemiro de Abreu',
      numero: '238',
      complemento: 'Apto 12',
      bairro: 'Maracanã',
      cidade: 'Colombo',
      estado: 'PR',
      notes: 'Histórico de bruxismo. Sensibilidade em dentes inferiores.',
    },
    {
      name: 'Carlos Oliveira',
      email: 'carlos.oliveira@email.com',
      phone: '41987654321',
      cpf: '11144477735',
      birthDate: new Date('1985-07-22'),
      cep: '83406100',
      logradouro: 'Rua João Bettega',
      numero: '512',
      complemento: null,
      bairro: 'Centro',
      cidade: 'Colombo',
      estado: 'PR',
      notes: null,
    },
    {
      name: 'Fernanda Lima',
      email: 'fernanda.lima@email.com',
      phone: '41976543210',
      cpf: '47593814860',
      birthDate: new Date('1995-11-08'),
      cep: '83411000',
      logradouro: 'Rua XV de Novembro',
      numero: '87',
      complemento: 'Casa 2',
      bairro: 'Jardim Osasco',
      cidade: 'Colombo',
      estado: 'PR',
      notes: null,
    },
    {
      name: 'Roberto Souza',
      email: 'roberto.souza@email.com',
      phone: '41965432109',
      cpf: '65427518907',
      birthDate: new Date('1978-04-30'),
      cep: '83404050',
      logradouro: 'Avenida Paraná',
      numero: '1200',
      complemento: null,
      bairro: 'São Gabriel',
      cidade: 'Colombo',
      estado: 'PR',
      notes: 'Hipertenso. Informar antes de procedimentos cirúrgicos.',
    },
    {
      name: 'Ana Paula Mendes',
      email: 'ana.mendes@email.com',
      phone: '41954321098',
      cpf: '37678011682',
      birthDate: new Date('1988-09-14'),
      cep: '83408090',
      logradouro: 'Rua José Bonifácio',
      numero: '45',
      complemento: null,
      bairro: 'Monza',
      cidade: 'Colombo',
      estado: 'PR',
      notes: null,
    },
    {
      name: 'Lucas Ferreira',
      email: null,
      phone: '41943210987',
      cpf: null,
      birthDate: new Date('2001-01-20'),
      cep: '83412000',
      logradouro: 'Rua das Araucárias',
      numero: '33',
      complemento: null,
      bairro: 'Roça Grande',
      cidade: 'Colombo',
      estado: 'PR',
      notes: null,
    },
    {
      name: 'Mariana Costa',
      email: null,
      phone: '41932109876',
      cpf: null,
      birthDate: new Date('1999-06-05'),
      cep: null,
      logradouro: null,
      numero: null,
      complemento: null,
      bairro: null,
      cidade: 'Colombo',
      estado: 'PR',
      notes: null,
    },
  ]

  const createdPatients: any[] = []
  for (const p of patients) {
    const upsertEmail = p.email ?? `seed_${p.name.toLowerCase().replace(/\s+/g, '_')}@placeholder.internal`
    const patient = await prisma.patient.upsert({
      where: { email: upsertEmail },
      update: {},
      create: {
        name: p.name,
        email: p.email ?? null,
        phone: p.phone,
        cpf: p.cpf ?? null,
        birthDate: p.birthDate,
        cep: p.cep ?? null,
        logradouro: p.logradouro ?? null,
        numero: p.numero ?? null,
        complemento: p.complemento ?? null,
        bairro: p.bairro ?? null,
        cidade: p.cidade ?? null,
        estado: p.estado ?? null,
        notes: p.notes ?? null,
      },
    }).catch(async () =>
      prisma.patient.create({
        data: { name: p.name, phone: p.phone, email: null },
      })
    )
    createdPatients.push(patient)
  }
  console.log('✅ Patients created:', createdPatients.length)

  // ── Services ────────────────────────────────────────────────────────────────
  const serviceData = [
    {
      id: 'service-clinica-geral',
      title: 'Clínica Geral',
      shortDesc: 'Consultas, diagnósticos e tratamentos preventivos para manter sua saúde bucal em dia com cuidado e atenção.',
      longDesc: 'A Clínica Geral é a base de toda a odontologia. Na CB Odonto, realizamos consultas completas, diagnósticos precisos e planos de tratamento personalizados. Nossos profissionais estão preparados para cuidar da sua saúde bucal de forma integral, prevenindo problemas antes que eles se tornem mais graves. Atendemos adultos e crianças com a mesma dedicação e carinho.',
      imageUrl: null,
      active: true,
      position: 0,
    },
    {
      id: 'service-dentistica',
      title: 'Dentística & Resinas',
      shortDesc: 'Restaurações em resina que devolvem forma, função e estética ao dente de forma natural e durável.',
      longDesc: 'A Dentística é a especialidade responsável pela restauração e embelezamento dos dentes. Utilizamos resinas compostas de última geração, que mimetizam com perfeição a cor e a translucidez do esmalte natural. Nossas restaurações devolvem a função mastigatória e proporcionam um resultado estético que ninguém consegue distinguir do dente original.',
      imageUrl: null,
      active: true,
      position: 1,
    },
    {
      id: 'service-bruxismo',
      title: 'Placa de Bruxismo',
      shortDesc: 'Proteção noturna personalizada para quem range os dentes, aliviando dores e preservando o esmalte dentário.',
      longDesc: 'O bruxismo é o hábito involuntário de ranger ou apertar os dentes, geralmente durante o sono. Com o tempo, causa desgaste severo do esmalte, dores de cabeça, dores na mandíbula e até fraturas dentárias. A placa oclusal (placa de bruxismo) é um dispositivo personalizado, confeccionado sob medida, que protege seus dentes e reduz a tensão muscular durante a noite.',
      imageUrl: null,
      active: true,
      position: 2,
    },
    {
      id: 'service-clareamento',
      title: 'Clareamento Dental',
      shortDesc: 'Dentes até 8 tons mais claros com segurança e resultado duradouro, supervisionado por especialistas.',
      longDesc: 'O clareamento dental é um dos procedimentos estéticos mais procurados e seguros da odontologia moderna. Na CB Odonto, oferecemos clareamento a laser (de consultório) e clareamento caseiro com moldeiras personalizadas, ou a combinação dos dois para resultados ainda mais expressivos. Avaliamos o caso individualmente para indicar o protocolo ideal para você.',
      imageUrl: null,
      active: true,
      position: 3,
    },
    {
      id: 'service-exodontia',
      title: 'Exodontia',
      shortDesc: 'Extrações simples e de dentes do siso com segurança, conforto e técnica apurada para uma recuperação rápida.',
      longDesc: 'A exodontia, ou extração dentária, é indicada quando o dente não pode mais ser recuperado ou quando está causando prejuízo à saúde bucal — como no caso dos sisos inclusos. Na CB Odonto, realizamos extrações simples e cirúrgicas com todo o cuidado necessário para garantir o conforto durante e após o procedimento, com orientações detalhadas para uma recuperação tranquila.',
      imageUrl: null,
      active: true,
      position: 4,
    },
    {
      id: 'service-microagulhamento',
      title: 'Microagulhamento Facial',
      shortDesc: 'Tratamento estético que estimula a produção de colágeno, rejuvenescendo e revitalizando a pele do rosto.',
      longDesc: 'O microagulhamento (também chamado de indução percutânea de colágeno) é um procedimento minimamente invasivo que utiliza microagulhas para criar microcanais na pele, estimulando a produção natural de colágeno e elastina. Indicado para tratar rugas finas, cicatrizes de acne, manchas e flacidez leve, promovendo uma pele mais jovem, firme e luminosa com resultados progressivos e duradouros.',
      imageUrl: null,
      active: true,
      position: 5,
    },
    {
      id: 'service-harmonizacao',
      title: 'Harmonização Orofacial',
      shortDesc: 'Toxina botulínica e preenchimento para harmonizar e realçar a beleza natural do rosto com resultados sutis.',
      longDesc: 'A Harmonização Orofacial (HOF) é um conjunto de procedimentos estéticos minimamente invasivos realizados por cirurgiões-dentistas habilitados. Na CB Odonto, trabalhamos com toxina botulínica para suavizar rugas dinâmicas, preenchedores dérmicos para volumizar lábios e contornar o rosto, além de fios de sustentação e bioremodeladores. O objetivo é sempre um resultado natural, que realce suas características sem perder a identidade.',
      imageUrl: null,
      active: true,
      position: 6,
    },
    {
      id: 'service-limpeza',
      title: 'Limpeza & Profilaxia',
      shortDesc: 'Remoção profissional de tártaro e placa bacteriana para gengivas saudáveis e sorriso mais brilhante.',
      longDesc: 'A profilaxia dental (limpeza profissional) é um procedimento preventivo fundamental realizado pelo cirurgião-dentista. Remove a placa bacteriana e o tártaro que o escovamento diário não consegue eliminar, prevenindo cáries, gengivite e doenças periodontais. Recomendamos a realização a cada 6 meses para manter a saúde bucal em dia. O procedimento também inclui polimento dos dentes, deixando-os mais brancos e brilhantes.',
      imageUrl: null,
      active: true,
      position: 7,
    },
  ]

  for (const s of serviceData) {
    await prisma.service.upsert({
      where: { id: s.id },
      update: {},
      create: s,
    })
  }
  console.log('✅ Services created:', serviceData.length)

  // ── Appointments ────────────────────────────────────────────────────────────
  const services = [
    'Consulta Geral', 'Limpeza Dental', 'Restauração em Resina',
    'Placa de Bruxismo', 'Exodontia', 'Harmonização Orofacial',
    'Clareamento Dental', 'Microagulhamento',
  ]
  const statuses: AppointmentStatus[] = ['CONFIRMED', 'PENDING', 'COMPLETED', 'CANCELLED']

  for (let i = 0; i < 12; i++) {
    const d = new Date()
    d.setDate(d.getDate() + (i - 5))
    d.setHours(0, 0, 0, 0)

    const hour = 8 + (i % 9)
    const dentist = i % 2 === 0 ? samara : samuel
    const patient = createdPatients[i % createdPatients.length]
    const status = i < 5 ? statuses[2] : i < 8 ? statuses[0] : statuses[1]

    await prisma.appointment.create({
      data: {
        dentistId: dentist.id,
        patientId: patient.id,
        date: d,
        startTime: `${String(hour).padStart(2, '0')}:00`,
        endTime: `${String(hour).padStart(2, '0')}:30`,
        service: services[i % services.length],
        status,
        source: i % 3 === 0 ? AppointmentSource.WEBSITE : AppointmentSource.WHATSAPP,
        notes: i === 0 ? 'Paciente com histórico de bruxismo' : null,
      },
    }).catch(() => {})
  }
  console.log('✅ Appointments created')

  // ── Testimonials ────────────────────────────────────────────────────────────
  // photoUrl: null no seed — fotos reais são enviadas pelo painel admin via S3.
  const testimonials = [
    {
      patientName: 'Sarah Camargo',
      text: 'Fui atendida pela Dra. Samara e só tenho elogios. Tenho muita sensibilidade nos dentes e sofri anos para comer doces ou alimentos gelados. Descobri que, por conta do bruxismo, minha gengiva havia retraído e quase deixado a raiz exposta. Nenhum outro dentista havia me orientado sobre isso, mas ela identificou o problema e resolveu com um preenchimento em resina perfeito. Fiz também a plaquinha para bruxismo, por um preço excelente e com parcelamento facilitado. O atendimento dela é maravilhoso, realmente mãos de fada! Recomendo de olhos fechados.',
      rating: 5,
      source: 'Google',
      photoUrl: null,
      approved: true,
    },
    {
      patientName: 'Carlos Oliveira',
      text: 'Dr. Samuel é excelente! Muito cuidadoso e atencioso durante todo o processo de extração do siso. Não senti dor nenhuma e a recuperação foi super rápida. Clínica muito bem equipada e limpa. Super recomendo!',
      rating: 5,
      source: 'Google',
      photoUrl: null,
      approved: true,
    },
    {
      patientName: 'Fernanda Lima',
      text: 'Fiz harmonização orofacial com a Dra. Samara e o resultado ficou incrível! Natural, harmônico, exatamente o que eu queria. Ela é muito profissional e explica cada etapa do procedimento. Voltarei com certeza.',
      rating: 5,
      source: 'Google',
      photoUrl: null,
      approved: true,
    },
    {
      patientName: 'Ana Paula Mendes',
      text: 'Atendimento excelente! Clínica aconchegante, profissionais muito competentes. A Dra. Samara foi super atenciosa com minha filha que tem medo de dentista. Saímos de lá com ela sorrindo. Parabéns!',
      rating: 5,
      source: 'Google',
      photoUrl: null,
      approved: false,
    },
  ]

  for (const t of testimonials) {
    await prisma.testimonial.create({ data: t }).catch(() => {})
  }
  console.log('✅ Testimonials created')

  // ── Site Settings ───────────────────────────────────────────────────────────
  await prisma.siteSettings.upsert({
    where: { id: 'main' },
    update: {},
    create: {
      id: 'main',
      whatsappNumber: '5541997234253',
      address: 'R. Casemiro de Abreu, 238 – Maracanã, Colombo – PR, 83409-070',
      openHours: 'Segunda a Sexta: 08h – 18h',
    },
  })
  console.log('✅ Site settings created')

  console.log('\n🎉 Seed completed!')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('Admin login:')
  console.log('  Email:    admin@cbodonto.com.br')
  console.log('  Password: cbodonto@2025')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
