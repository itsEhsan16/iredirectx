# iRedirectX - Smart URL Shortener & Link Management Platform

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/iredirectx)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb)](https://reactjs.org/)

## 📋 Overview

iRedirectX is a comprehensive URL shortening and link management platform designed for businesses and individuals who need powerful link tracking, analytics, and management capabilities. Built with modern web technologies, it offers a seamless experience for creating, organizing, and analyzing shortened URLs.

### ✨ Key Features

- **🔗 URL Shortening** - Create custom short links with memorable aliases
- **📊 Advanced Analytics** - Track clicks, referrers, devices, and geographic data
- **🎯 Custom Redirect Rules** - Set up conditional redirects based on device, location, or time
- **📱 QR Code Generation** - Generate QR codes for easy mobile sharing
- **⏰ Link Expiration** - Set automatic expiration dates for temporary campaigns
- **🔒 Password Protection** - Secure sensitive links with password authentication
- **📈 Real-time Dashboard** - Monitor link performance with live metrics
- **🏢 Team Collaboration** - Manage links across teams with role-based access
- **🔄 Bulk Operations** - Import/export links and perform batch actions
- **🌐 Custom Domains** - Use your own branded domains for short URLs

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Supabase account for backend services
- Git for version control

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/iredirectx.git
cd iredirectx

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Supabase credentials

# Start development server
npm run dev
```

The application will be available at `http://localhost:8080`

## 🛠️ Technology Stack

### Frontend
- **React 18.3** - UI library for building user interfaces
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - High-quality React components
- **React Router** - Client-side routing
- **React Query** - Server state management
- **React Hook Form** - Form handling with validation

### Backend
- **Supabase** - Backend-as-a-Service platform
  - PostgreSQL database
  - Authentication & authorization
  - Real-time subscriptions
  - Row Level Security (RLS)
  - Edge Functions

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Husky** - Git hooks
- **GitHub Actions** - CI/CD pipeline

## 📦 Project Structure

```
iredirectx/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/          # Application pages/routes
│   ├── hooks/          # Custom React hooks
│   ├── utils/          # Utility functions
│   ├── lib/            # Third-party integrations
│   ├── types/          # TypeScript type definitions
│   └── styles/         # Global styles
├── public/             # Static assets
├── dist/               # Production build output
└── supabase/           # Supabase migrations & functions
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_SUPABASE_PROJECT_ID=your_supabase_project_id
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

### Database Setup

1. Create a new Supabase project
2. Run the SQL migrations in `supabase/migrations/`
3. Configure authentication providers in Supabase dashboard
4. Set up Row Level Security policies

## 📜 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run test         # Run tests
npm run type-check   # Run TypeScript compiler check
```

## 🚢 Deployment

### Vercel (Recommended)

1. Click the "Deploy with Vercel" button above
2. Configure environment variables
3. Deploy

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)

### Other Platforms

- **Netlify**: Use the Netlify CLI or connect GitHub repository
- **AWS Amplify**: Import from GitHub and configure build settings
- **Cloudflare Pages**: Connect repository and set framework preset to Vite

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for detailed contribution guidelines.

## 📊 Performance

- **Lighthouse Score**: 95+ Performance
- **Bundle Size**: < 500KB gzipped
- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3s

## 🔒 Security

- All API keys are stored as environment variables
- Row Level Security (RLS) enabled on all database tables
- Input validation and sanitization
- HTTPS enforced in production
- Regular dependency updates

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Supabase](https://supabase.com) for the backend infrastructure
- [Vercel](https://vercel.com) for hosting and deployment
- [shadcn/ui](https://ui.shadcn.com) for the component library
- [Tailwind CSS](https://tailwindcss.com) for the styling framework

## 📧 Support

For support, email mdehsan2737@gmail.com or open an issue in the GitHub repository.


---

**Built with ❤️ by the iRedirectX Team**
