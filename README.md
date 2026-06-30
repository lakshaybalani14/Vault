# Vault

Vault is a modern, secure, and intuitive "Lost & Found" platform built exclusively for students at VIT Vellore. It simplifies the process of finding lost items, coordinating secure meetups, and building trust within the campus community.

## ✨ Key Features

- **VIT Student Verification**: Secure authentication restricting access solely to verified `@vitstudent.ac.in` and `@vit.ac.in` email addresses.
- **Smart Categorization**: Quickly post or search for lost and found items (Electronics, IDs, Keys, Books, etc.).
- **Meetup Coordinator**: Securely propose and accept meetup times and on-campus locations without exposing personal phone numbers.
- **Trust System**: A gamified profile system that tracks "Items Found" to highlight trustworthy and helpful students.
- **Premium UI/UX**: A highly polished, responsive interface with dark mode support, smooth GSAP scroll animations, and fluid Framer Motion transitions.

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Styling**: Vanilla CSS (CSS Variables) with a custom design system
- **Animations**: [Framer Motion](https://motion.dev/) & [GSAP](https://gsap.com/)
- **Backend & Auth**: [Supabase](https://supabase.com/) (PostgreSQL, Row Level Security, Supabase Auth)
- **Deployment**: [Vercel](https://vercel.com/)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A Supabase project

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/lakshaybalani14/Vault.git
   cd Vault/vault-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env.local` file in the `vault-app` directory with your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   NEXT_PUBLIC_ALLOWED_EMAIL_DOMAINS=vitstudent.ac.in,vit.ac.in
   ```

4. **Run the Development Server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📂 Project Structure

- `/app`: Next.js App Router pages and layouts.
- `/components`:
  - `/shared/ui`: Reusable UI primitives (Buttons, Modals, Steppers).
  - `/shared/landing`: Complex animation components for the marketing page.
  - `/[feature]`: Feature-specific components (e.g., `posts`, `claims`, `analytics`).
- `/lib`: Utility functions, Supabase client configurations, and server actions.
- `../docs`: Detailed documentation for database schemas, deployment, and architecture.

## 📝 License

Designed and developed by Lakshay Balani for the VIT community.
