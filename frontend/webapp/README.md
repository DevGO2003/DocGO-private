# DocGO Web Application

A modern React web application built with Vite, TypeScript, and shadcn/ui following MVC architecture.

## 🚀 Tech Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Components**: shadcn/ui with Tailwind CSS
- **State Management**: Redux Toolkit
- **Data Fetching**: TanStack React Query
- **Routing**: React Router v6
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Testing**: Jest + React Testing Library

## 📁 Project Structure

```
src/
├── features/           # Feature modules (MVC pattern)
│   ├── auth/          # Authentication feature
│   │   ├── models/    # Data layer (API, types, state)
│   │   ├── views/     # UI layer (pages, components)
│   │   └── controllers/ # Logic layer (hooks)
│   ├── products/      # Products feature
│   └── orders/        # Orders feature
├── shared/            # Shared components and utilities
│   ├── components/    # Reusable UI components
│   └── lib/          # Utility functions
├── store/            # Redux store configuration
├── routes/           # Routing configuration
├── utils/            # Global utilities
├── constants/        # Application constants
├── App.tsx           # Root component
└── main.tsx          # Application entry point
```

## 🛠️ Installation

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp .env.example .env.local
```

3. Update `.env.local` with your API configuration:
```
VITE_API_BASE_URL=http://localhost:8080/api
```

## 🚀 Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 🏗️ Build

Build for production:
```bash
npm run build
```

Preview production build:
```bash
npm run preview
```

## 🧪 Testing

Run tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

## 📝 Code Style

Lint code:
```bash
npm run lint
```

## 🏛️ Architecture

### MVC Pattern

Each feature follows the MVC (Model-View-Controller) pattern:

- **Models**: Data layer containing API calls, types, and Redux state
- **Views**: UI layer with pages and components
- **Controllers**: Business logic layer with custom hooks

### Features

#### Auth Feature
- Login, Register, Forgot Password pages
- JWT token management
- Protected routes

#### Products Feature
- Product list with pagination
- Product detail view
- Create/Edit product forms
- Delete functionality

#### Orders Feature
- Order list
- Order detail view
- Order status tracking

## 🎨 UI Components

Built with shadcn/ui components:
- Button
- Input
- Card
- And more...

All components are customizable and follow Tailwind CSS conventions.

## 🔧 Configuration

### Path Aliases

The project uses path aliases for cleaner imports:
- `@/` - src directory
- `@shared/` - shared components
- `@features/` - feature modules
- `@utils/` - utilities
- `@constants/` - constants
- `@routes/` - routing
- `@store/` - Redux store

### Environment Variables

- `VITE_API_BASE_URL` - Backend API URL

## 📦 Key Dependencies

- `react` - UI library
- `react-router-dom` - Routing
- `@reduxjs/toolkit` - State management
- `@tanstack/react-query` - Data fetching
- `tailwindcss` - Styling
- `lucide-react` - Icons
- `class-variance-authority` - Component variants

## 🤝 Contributing

1. Follow the established MVC structure
2. Use TypeScript for type safety
3. Write tests for new features
4. Follow the existing code style

## 📄 License

MIT
