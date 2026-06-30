# Vault Core

Vault is a high-performance, strictly-typed "Lost & Found" platform engineered for the VIT Vellore campus network. Built on a modern serverless architecture, it enforces strict domain-based authentication, implements secure state-driven meetup coordination, and leverages hardware-accelerated animations for a premium user experience.

## ⚡ Architecture & Tech Stack

- **Core Framework**: [Next.js 16.2](https://nextjs.org/) (App Router) with **Turbopack** for ultra-fast HMR and optimized production builds.
- **State & Data Mutations**: Server Actions (`"use server"`) for zero-API-route data mutations and optimistic UI updates.
- **Authentication**: [Supabase Auth](https://supabase.com/auth) with strict OAuth / Magic Link flows, locked to `@vitstudent.ac.in` and `@vit.ac.in` domains via edge middleware.
- **Database**: PostgreSQL (via [Supabase](https://supabase.com/database)) utilizing complex **Row Level Security (RLS)** policies to ensure data isolation between users.
- **Styling Architecture**: **Custom CSS Variables Design System** (No Tailwind). We engineered a bespoke, dependency-free CSS architecture utilizing `color-mix()` for dynamic theme generation, resulting in a lighter DOM and zero utility-class bloat.
- **Animation Engine**: 
  - **[GSAP (GreenSock)](https://gsap.com/)**: Handling complex scroll-linked timelines, scrub interpolations, and staggered layout reveals.
  - **[Framer Motion](https://motion.dev/)**: Managing physics-based spring animations, layout transitions, and `AnimatePresence` unmounting.
- **Deployment**: [Vercel](https://vercel.com/) Edge Network.

## 🔧 Technical Features

- **Domain-Restricted Auth Gateway**: Edge-computed middleware intercepts unauthorized domains before hitting the main thread.
- **Zero-Trust Meetup Coordinator**: A state-machine-driven meetup system allowing students to securely propose, negotiate, and finalize on-campus handoffs without exchanging PII (Personally Identifiable Information).
- **Gamified Trust Heuristics**: Asynchronous triggers update a relational `profiles` table to calculate user reliability scores based on verified item returns.
- **Hardware-Accelerated UI**: CSS utilizes `will-change: transform` and `translate3d` to offload paint operations to the GPU, ensuring buttery 60fps scrolling and hover states.

## 🚀 Local Development Environment

### Prerequisites
- Node.js 18.17+
- A configured Supabase project instance

### Setup Protocol

1. **Clone the repository**
   ```bash
   git clone https://github.com/lakshaybalani14/Vault.git
   cd Vault/vault-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Injection**
   Create a `.env.local` file in the `vault-app` directory and inject your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   NEXT_PUBLIC_ALLOWED_EMAIL_DOMAINS=vitstudent.ac.in,vit.ac.in
   ```

4. **Initialize Turbopack Server**
   ```bash
   npm run dev
   ```
   The application will mount at [http://localhost:3000](http://localhost:3000).

## 📂 System Topology

- `/app`: Next.js App Router tree (Server Components, Layouts, Loading Boundaries).
- `/components`:
  - `/shared/ui`: Reusable, atomic UI primitives (`Stepper`, `Plasma` backgrounds).
  - `/shared/landing`: Heavy, client-side animation wrappers (`ScrollReveal`, `DomeGallery`).
  - `/[feature]`: Domain-specific modular components (`posts`, `claims`, `analytics`).
- `/lib`: Supabase SSR client factories, Server Actions, and validation schemas.
- `../docs`: Internal architecture docs, SQL migrations (`follows_migration.sql`), and RLS definitions.

## 📝 License & Attribution

Architected and developed by Lakshay Balani.
