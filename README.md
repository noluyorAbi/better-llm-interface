# Intelligent LLM Interface

A modern, intelligent interface for Large Language Model interactions designed to enhance productivity and user satisfaction. Built as a Bachelor Thesis project at Ludwig Maximilian University of Munich (LMU).

**Repository**: [https://github.com/noluyorAbi/better-llm-interface](https://github.com/noluyorAbi/better-llm-interface)

## ✨ Features

- Core chat window for seamless LLM interactions
- Prompt history panel for quick access to previous prompts
- Media tab for viewing attached files
- Smart widget suggestions with context-aware actions
- Drag & drop canvas for organizing conversations
- Personalized experience with adaptive widget ordering
- Authentication with Supabase Auth
- Light/dark theme support

## 🛠️ Tech Stack

Next.js 16 • TypeScript • Tailwind CSS 4 • shadcn/ui • Supabase • Framer Motion • React Hook Form + Zod

## 🚀 Getting Started

### Prerequisites

- Node.js 20.x+
- Supabase account ([Sign up](https://supabase.com))

### Installation

```bash
git clone https://github.com/noluyorAbi/better-llm-interface.git
cd better-llm-interface
npm install
```

### Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key  # Optional
```

Get these values from [Supabase Dashboard](https://supabase.com/dashboard) → Settings → API

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📜 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lft` - Format, lint, type check

## 📚 Documentation

- [SMTP Configuration](./docs/SMTP_CONFIGURATION.md) - Configure custom SMTP for Supabase Auth emails
- [Account Deletion](./docs/ACCOUNT_DELETION.md) - Setup Supabase Service Role Key for account deletion

## 🚢 Deployment

Deploy on [Vercel](https://vercel.com) or any Node.js platform. Remember to set environment variables in your hosting dashboard.

## 🔒 Security

- Never commit `.env.local` or secrets
- Service Role Key only in server-side code
- Use environment variables for sensitive data

## 👤 Author

**Alperen Adatepe** - [adatepe.alperen@campus.lmu.de](mailto:adatepe.alperen@campus.lmu.de)  
Ludwig Maximilian University of Munich (LMU)

---

Built with ❤️ for LMU Bachelor Thesis
