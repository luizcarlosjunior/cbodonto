# CB Odonto – Campozano & Barcellos Odontologia

Site institucional + sistema administrativo para a clínica odontológica.

## Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Prisma ORM** (PostgreSQL)
- **NextAuth.js** (autenticação)
- **Vercel** (hospedagem)

---

## Estrutura do Projeto

```
cbodonto/
├── prisma/
│   ├── schema.prisma       # Modelos do banco de dados
│   └── seed.ts             # Dados de exemplo
├── src/
│   ├── app/
│   │   ├── (site)/         # Site público
│   │   ├── admin/          # Área administrativa
│   │   │   ├── login/
│   │   │   ├── agendamentos/
│   │   │   ├── clientes/
│   │   │   ├── dentistas/
│   │   │   └── depoimentos/
│   │   └── api/            # API Routes
│   ├── components/
│   │   ├── site/           # Componentes do site
│   │   └── admin/          # Componentes da área admin
│   └── lib/
│       ├── auth.ts         # Configuração NextAuth
│       ├── db.ts           # Prisma client singleton
│       └── utils.ts        # Utilitários
└── public/                 # Imagens estáticas
```

---

## Setup Local

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

Copie `.env.example` para `.env.local`:

```bash
cp .env.example .env.local
```

Preencha as variáveis:

```env
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="gere com: openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Banco de dados

```bash
# Criar as tabelas
npm run db:push

# Gerar o cliente Prisma
npm run db:generate

# Popular com dados de exemplo
npm run db:seed
```

### 4. Adicionar imagens

Coloque as seguintes imagens na pasta `/public`:

- `hero-bg.jpg` – imagem do hero (pode usar a foto de extração dentária)
- `dentists.jpg` – foto dos dentistas

### 5. Rodar o projeto

```bash
npm run dev
```

Acesse:

- **Site:** http://localhost:3000
- **Admin:** http://localhost:3000/admin

**Credenciais do admin (após seed):**

```
Email:    admin@cbodonto.com.br
Senha:    cbodonto@2025
```

---

## Deploy na Vercel

### 1. Banco de dados MySQL (escolha um)

**Opção A – PlanetScale (recomendado, gratuito):**

```
DATABASE_URL="mysql://user:pass@host/cbodonto?sslaccept=strict"
```

1. Crie uma conta em [planetscale.com](https://planetscale.com)
2. Crie um banco `cbodonto` e copie a connection string
3. Note: PlanetScale não suporta `prisma migrate`, use `prisma db push`

**Opção B – Railway MySQL:**

1. Crie um projeto em [railway.app](https://railway.app) com plugin MySQL
2. Copie a connection string em Variables

**Opção C – Clever Cloud (MySQL gratuito):**

1. Crie um add-on MySQL em [clever-cloud.com](https://clever-cloud.com)
2. Copie as credenciais de conexão

### 2. Deploy

1. Faça push do código para o GitHub
2. Importe o repositório na Vercel
3. Configure as variáveis de ambiente:
   - `DATABASE_URL` — sua connection string
   - `NEXTAUTH_SECRET` — gere com `openssl rand -base64 32`
   - `NEXTAUTH_URL` — será preenchido automaticamente pela Vercel

### 3. Build command e seed

Após o primeiro deploy, rode no terminal da Vercel ou localmente apontando para o banco de produção:

```bash
DATABASE_URL="sua-url-de-producao" npm run db:push
DATABASE_URL="sua-url-de-producao" npm run db:seed
```

### 4. package.json – prisma postinstall

Certifique-se que o `package.json` tem:

```json
"scripts": {
  "postinstall": "prisma generate"
}
```

(Já está configurado — necessário para a Vercel gerar o cliente Prisma no build)

---

## Área Administrativa

| Seção        | URL                     | Descrição                                    |
| ------------ | ----------------------- | -------------------------------------------- |
| Dashboard    | `/admin`                | Visão geral, métricas e alertas              |
| Agendamentos | `/admin/agendamentos`   | Listar, criar, editar e mudar status         |
| Clientes     | `/admin/clientes`       | Cadastro e histórico de pacientes            |
| Dentistas    | `/admin/dentistas`      | Gestão de profissionais                      |
| Horários     | `/admin/dentistas/[id]` | Disponibilidade semanal + indisponibilidades |
| Depoimentos  | `/admin/depoimentos`    | Aprovar, reprovar e adicionar depoimentos    |

---

## Site Público

| Seção       | Descrição                                               |
| ----------- | ------------------------------------------------------- |
| Hero        | Chamada principal com CTA para WhatsApp                 |
| Pilares     | Diferenciais da clínica                                 |
| Serviços    | 6 tratamentos com links diretos para WhatsApp           |
| Sobre       | Apresentação dos dentistas                              |
| Agendamento | Formulário online (cria appointment com status PENDING) |
| Depoimentos | Carrossel de reviews aprovados                          |
| Localização | Mapa + informações de contato                           |

---

## Personalização

### Substituir imagens reais

- Substitua `/public/hero-bg.jpg` e `/public/dentistas.png` pelas fotos reais

### Número WhatsApp

Edite em `src/lib/utils.ts`:

```ts
export const WA_NUMBER = "5541997234253";
```

### Cores / tema

Edite em `tailwind.config.js`:

```js
colors: {
  burgundy: { DEFAULT: '#6b2737', ... },
  gold: { DEFAULT: '#c4a97d', ... },
}
```

---

## Scripts Úteis

```bash
npm run dev          # Desenvolvimento
npm run build        # Build produção
npm run db:studio    # Prisma Studio (UI visual do banco)
npm run db:seed      # Popular dados de exemplo
npm run db:push      # Sincronizar schema sem migrations
npm run db:migrate   # Criar migration (produção)
```
