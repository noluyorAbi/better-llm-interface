# Intelligent LLM Interface

A modern, intelligent interface for Large Language Model interactions designed to enhance productivity and user satisfaction. Built as a Bachelor Thesis project at Ludwig Maximilian University of Munich (LMU).

**Repository**: [https://github.com/noluyorAbi/better-llm-interface](https://github.com/noluyorAbi/better-llm-interface)

## ✨ Features

- **Chat Interface** - Interactive chat GUI with OpenAI GPT-4o-mini at `/chat`
- **Unified Navigation** - Consistent navbar component across all pages
- **User Account Management** - Dropdown menu with settings and sign out
- Core chat window for seamless LLM interactions
- Prompt history panel for quick access to previous prompts
- Media tab for viewing attached files
- Smart widget suggestions with context-aware actions
- Drag & drop canvas for organizing conversations
- Personalized experience with adaptive widget ordering
- Authentication with Supabase Auth
- Light/dark theme support with smooth transitions

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Backend**: Supabase (Auth, Database, Storage)
- **AI Integration**: OpenAI API (GPT-4o-mini)
- **Animations**: Framer Motion
- **Forms**: React Hook Form + Zod validation
- **Package Manager**: Bun

## 🚀 Getting Started

### Prerequisites

- [Bun](https://bun.sh) (recommended) or Node.js 20.x+
- Supabase account ([Sign up](https://supabase.com))

### Installation

```bash
git clone https://github.com/noluyorAbi/better-llm-interface.git
cd better-llm-interface
bun install
```

### Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key  # Optional
OPENAI_API_KEY=your_openai_api_key  # Required for chat functionality
```

Get these values from:

- **Supabase**: [Supabase Dashboard](https://supabase.com/dashboard) → Settings → API
- **OpenAI**: [OpenAI Platform](https://platform.openai.com/api-keys) → API Keys

### Run Development Server

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📜 Scripts

- `bun dev` - Start development server
- `bun run build` - Build for production
- `bun start` - Start production server
- `bun run lint` - Run ESLint
- `bun run lft` - Format, lint, and type check (run before commits)

## 📚 Documentation

- [SMTP Configuration](./docs/SMTP_CONFIGURATION.md) - Configure custom SMTP for Supabase Auth emails
- [Account Deletion](./docs/ACCOUNT_DELETION.md) - Setup Supabase Service Role Key for account deletion

## 🎨 UI Components

The project uses a modular component architecture:

- **Navbar** - Unified navigation component used across all pages
- **Chat Sidebar** - Conversation history and management
- **Dropdown Menus** - Minimalistic, professional dropdown components
- **Theme Toggle** - Seamless light/dark mode switching

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
