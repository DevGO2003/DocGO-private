# 🏗️ DocGO Frontend Architecture

## 📚 Technology Stack

### Core Framework
- **React 18** - UI Framework
- **TypeScript** - Type Safety
- **Vite** - Build Tool & Dev Server

### UI Libraries (Priority Order)

#### 1️⃣ Primary: Hand-Drawn/Sketch UI
- **roughjs** ^4.6.6 - Hand-drawn graphics library (Core)
- **react-sketch-canvas** ^6.2.0 - Canvas-based sketching
- **react-konva** ^18.2.10 + **konva** ^9.3.0 - Canvas drawing framework

#### 2️⃣ Secondary: Material UI
- **@mui/material** ^5.15.0 - Material Design components
- **@emotion/react** ^11.11.3 - CSS-in-JS styling
- **@emotion/styled** ^11.11.0 - Styled components

#### 3️⃣ Animation (Primary)
- **animejs** ^3.2.2 - Powerful animation library (Main)
- **framer-motion** ^10.18.0 - React animation library

#### 4️⃣ Additional UI Tools
- **Tailwind CSS** - Utility-first CSS
- **lucide-react** - Icon library
- **class-variance-authority** - Component variants
- **clsx** & **tailwind-merge** - Class name utilities

### State Management
- **@reduxjs/toolkit** ^2.0.1 - Global state management
- **@tanstack/react-query** ^5.17.9 - Server state management
- **react-redux** ^9.0.4 - React bindings for Redux

### Routing
- **react-router-dom** ^6.21.1 - Client-side routing

### Testing
- **Jest** ^29.7.0 - Testing framework
- **@testing-library/react** ^14.1.2 - React testing utilities
- **@testing-library/jest-dom** ^6.1.5 - Custom matchers

---

## 📁 Project Structure (MVC Pattern)

```
webapp/
├── src/
│   ├── shared/                    # Shared components & utilities (View layer)
│   │   ├── components/            # Reusable UI components
│   │   │   ├── HandDrawn/         # Hand-drawn UI components ✅ IMPLEMENTED
│   │   │   │   ├── Button/              # ✅ Hand-drawn button
│   │   │   │   │   ├── HandDrawnButton.tsx    # Canvas + hover effects ✅
│   │   │   │   │   └── index.ts ✅
│   │   │   │   ├── Input/               # ✅ Hand-drawn input
│   │   │   │   │   ├── HandDrawnInput.tsx     # Canvas borders + autofill ✅
│   │   │   │   │   └── index.ts ✅
│   │   │   │   ├── Card/                # ✅ Hand-drawn card
│   │   │   │   │   ├── HandDrawnCard.tsx      # Card with subcomponents ✅
│   │   │   │   │   └── index.ts ✅
│   │   │   │   ├── Sketch/              # ✅ Rough.js drawing components
│   │   │   │   │   ├── SketchBox.tsx          # Hand-drawn rectangle ✅
│   │   │   │   │   ├── SketchCircle.tsx       # Hand-drawn circle ✅
│   │   │   │   │   ├── SketchLine.tsx         # Hand-drawn line ✅
│   │   │   │   │   └── index.ts ✅
│   │   │   │   └── index.ts ✅
│   │   │   ├── Material/           # MUI components (Secondary)
│   │   │   │   ├── MuiButton/
│   │   │   │   │   ├── MuiButton.tsx        # Material UI button wrapper
│   │   │   │   │   ├── MuiButton.types.ts
│   │   │   │   │   ├── MuiButton.styles.ts  # Emotion styled
│   │   │   │   │   ├── MuiButton.test.tsx
│   │   │   │   │   └── index.ts
│   │   │   │   ├── MuiCard/
│   │   │   │   │   ├── MuiCard.tsx
│   │   │   │   │   ├── MuiCard.types.ts
│   │   │   │   │   ├── MuiCard.styles.ts
│   │   │   │   │   ├── MuiCard.test.tsx
│   │   │   │   │   └── index.ts
│   │   │   │   ├── MuiInput/
│   │   │   │   │   ├── MuiInput.tsx
│   │   │   │   │   ├── MuiInput.types.ts
│   │   │   │   │   ├── MuiInput.styles.ts
│   │   │   │   │   ├── MuiInput.test.tsx
│   │   │   │   │   └── index.ts
│   │   │   │   └── index.ts
│   │   │   ├── Animations/         # Animation utilities ✅ IMPLEMENTED
│   │   │   │   ├── FadeIn.tsx              # Framer Motion fade animations ✅
│   │   │   │   ├── SlideIn.tsx             # Framer Motion slide animations ✅
│   │   │   │   ├── Bounce.tsx              # Framer Motion bounce animations ✅
│   │   │   │   ├── DrawIn.tsx              # Hand-drawn reveal animation ✅
│   │   │   │   ├── useAnimation.ts         # Animation hook + variants ✅
│   │   │   │   └── index.ts ✅
│   │   │   ├── Layout/                 # Layout utilities ✅ IMPLEMENTED
│   │   │   │   ├── Container.tsx          # Responsive container ✅
│   │   │   │   ├── Grid.tsx               # Grid layout ✅
│   │   │   │   ├── Stack.tsx              # Flex stack ✅
│   │   │   │   └── index.ts ✅
│   │   │   └── index.ts ✅
│   │   ├── layouts/               # Page layouts ✅ IMPLEMENTED
│   │   │   ├── AuthLayout/        # ✅ Auth layout (no sidebar/header)
│   │   │   │   ├── AuthLayout.tsx          # Auth pages wrapper
│   │   │   │   └── index.ts
│   │   │   ├── DashboardLayout/   # ✅ Dashboard layout (full layout)
│   │   │   │   ├── DashboardLayout.tsx     # Main app wrapper
│   │   │   │   └── index.ts
│   │   │   ├── MainLayout/        # ✅ Main layout with components
│   │   │   │   ├── MainLayout.tsx          # Layout orchestrator
│   │   │   │   ├── Sidebar.tsx             # Collapsible sidebar with nav
│   │   │   │   ├── Header.tsx              # Top header with search/user
│   │   │   │   └── index.ts
│   │   │   └── index.ts
│   │   ├── lib/                   # Utility functions ✅ IMPLEMENTED
│   │   │   ├── utils.ts                    # General utilities (cn) ✅
│   │   │   ├── roughUtils.ts               # Rough.js helpers ✅
│   │   │   ├── animationUtils.ts           # Framer Motion helpers ✅
│   │   │   └── index.ts ✅
│   │   ├── theme/                 # Theme configuration ✅ IMPLEMENTED
│   │   │   ├── handDrawnTheme.ts           # Hand-drawn theme config ✅
│   │   │   ├── muiTheme.ts                 # MUI theme config ✅
│   │   │   ├── animations.ts               # Animation variants & presets ✅
│   │   │   └── index.ts ✅
│   │   └── index.ts
│   │
│   ├── features/                  # Feature modules (MVC architecture)
│   │   ├── auth/                  # Authentication feature
│   │   │   ├── models/            # Model layer (Data)
│   │   │   │   ├── api/
│   │   │   │   │   ├── authApi.ts          # API calls with React-Query
│   │   │   │   │   ├── authApi.types.ts    # Request/Response types
│   │   │   │   │   └── index.ts
│   │   │   │   ├── types/
│   │   │   │   │   ├── auth.types.ts       # User, Credentials interfaces
│   │   │   │   │   └── index.ts
│   │   │   │   ├── state/
│   │   │   │   │   ├── authSlice.ts        # Redux slice
│   │   │   │   │   └── index.ts
│   │   │   │   └── index.ts
│   │   │   ├── views/             # View layer (UI)
│   │   │   │   ├── pages/
│   │   │   │   │   ├── Login/
│   │   │   │   │   │   ├── Login.tsx              # Login page (hand-drawn UI)
│   │   │   │   │   │   ├── Login.styles.ts
│   │   │   │   │   │   ├── Login.animations.ts    # Page animations
│   │   │   │   │   │   ├── Login.test.tsx
│   │   │   │   │   │   └── index.ts
│   │   │   │   │   ├── Register/
│   │   │   │   │   │   ├── Register.tsx           # Register page
│   │   │   │   │   │   ├── Register.styles.ts
│   │   │   │   │   │   ├── Register.animations.ts
│   │   │   │   │   │   ├── Register.test.tsx
│   │   │   │   │   │   └── index.ts
│   │   │   │   │   ├── ForgotPassword.tsx         # Forgot password page
│   │   │   │   │   └── index.ts
│   │   │   │   ├── components/
│   │   │   │   │   ├── AuthForm/
│   │   │   │   │   │   ├── AuthForm.tsx           # Hand-drawn form component
│   │   │   │   │   │   ├── AuthForm.types.ts
│   │   │   │   │   │   ├── AuthForm.styles.ts
│   │   │   │   │   │   ├── AuthForm.animations.ts
│   │   │   │   │   │   ├── AuthForm.test.tsx
│   │   │   │   │   │   └── index.ts
│   │   │   │   │   ├── ErrorMessage.tsx
│   │   │   │   │   └── index.ts
│   │   │   │   └── index.ts
│   │   │   ├── controllers/       # Controller layer (Logic)
│   │   │   │   ├── useAuthFormController.ts      # Form logic hook
│   │   │   │   ├── useLoginController.ts         # Login logic
│   │   │   │   ├── useRegisterController.ts      # Register logic
│   │   │   │   └── index.ts
│   │   │   ├── tests/             # Feature tests
│   │   │   │   ├── authApi.test.ts
│   │   │   │   ├── useLoginController.test.ts
│   │   │   │   └── integration.test.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── products/              # Products feature
│   │   │   ├── models/
│   │   │   │   ├── api/
│   │   │   │   │   ├── productApi.ts       # React-Query queries/mutations
│   │   │   │   │   ├── productApi.types.ts
│   │   │   │   │   └── index.ts
│   │   │   │   ├── types/
│   │   │   │   │   ├── product.types.ts    # Product interface
│   │   │   │   │   └── index.ts
│   │   │   │   ├── state/
│   │   │   │   │   ├── productSlice.ts     # Redux slice
│   │   │   │   │   └── index.ts
│   │   │   │   └── index.ts
│   │   │   ├── views/
│   │   │   │   ├── pages/
│   │   │   │   │   ├── ProductList/
│   │   │   │   │   │   ├── ProductList.tsx        # Hand-drawn product grid
│   │   │   │   │   │   ├── ProductList.styles.ts
│   │   │   │   │   │   ├── ProductList.animations.ts
│   │   │   │   │   │   ├── ProductList.test.tsx
│   │   │   │   │   │   └── index.ts
│   │   │   │   │   ├── ProductDetail/
│   │   │   │   │   │   ├── ProductDetail.tsx      # Detailed view
│   │   │   │   │   │   ├── ProductDetail.styles.ts
│   │   │   │   │   │   ├── ProductDetail.animations.ts
│   │   │   │   │   │   ├── ProductDetail.test.tsx
│   │   │   │   │   │   └── index.ts
│   │   │   │   │   ├── ProductEdit.tsx            # Edit/Create form
│   │   │   │   │   └── index.ts
│   │   │   │   ├── components/
│   │   │   │   │   ├── ProductCard/
│   │   │   │   │   │   ├── ProductCard.tsx        # Hand-drawn card (memoized)
│   │   │   │   │   │   ├── ProductCard.types.ts
│   │   │   │   │   │   ├── ProductCard.styles.ts
│   │   │   │   │   │   ├── ProductCard.animations.ts  # Card reveal animation
│   │   │   │   │   │   ├── ProductCard.test.tsx
│   │   │   │   │   │   └── index.ts
│   │   │   │   │   ├── ProductForm.tsx            # Hand-drawn form
│   │   │   │   │   └── index.ts
│   │   │   │   └── index.ts
│   │   │   ├── controllers/
│   │   │   │   ├── useProductFetchController.ts   # Fetch with React-Query
│   │   │   │   ├── useProductEditController.ts    # Edit/Create logic
│   │   │   │   └── index.ts
│   │   │   ├── tests/
│   │   │   │   ├── productApi.test.ts
│   │   │   │   ├── useProductFetchController.test.ts
│   │   │   │   └── ProductCard.test.tsx
│   │   │   └── index.ts
│   │   │
│   │   └── orders/                # Orders feature
│   │       ├── models/
│   │       │   ├── api/
│   │       │   │   ├── orderApi.ts
│   │       │   │   ├── orderApi.types.ts
│   │       │   │   └── index.ts
│   │       │   ├── types/
│   │       │   │   ├── order.types.ts      # Order, OrderItem interfaces
│   │       │   │   └── index.ts
│   │       │   ├── state/
│   │       │   │   ├── orderSlice.ts
│   │       │   │   └── index.ts
│   │       │   └── index.ts
│   │       ├── views/
│   │       │   ├── pages/
│   │       │   │   ├── OrderList.tsx              # Hand-drawn order list
│   │       │   │   ├── OrderDetail.tsx            # Order detail view
│   │       │   │   └── index.ts
│   │       │   ├── components/
│   │       │   │   ├── OrderItem/
│   │       │   │   │   ├── OrderItem.tsx          # Hand-drawn order card
│   │       │   │   │   ├── OrderItem.types.ts
│   │       │   │   │   ├── OrderItem.styles.ts
│   │       │   │   │   ├── OrderItem.animations.ts
│   │       │   │   │   └── index.ts
│   │       │   │   └── index.ts
│   │       │   └── index.ts
│   │       ├── controllers/
│   │       │   ├── useOrderFetchController.ts
│   │       │   └── index.ts
│   │       ├── tests/
│   │       │   └── OrderList.test.tsx
│   │       └── index.ts
│   │
│   ├── store/                     # Redux store (Global state)
│   │   ├── index.ts                        # Store configuration
│   │   ├── hooks.ts                        # Typed hooks (useAppDispatch, useAppSelector)
│   │   └── middleware.ts                   # Custom middleware
│   │
│   ├── utils/                     # Global utilities
│   │   ├── formatters/
│   │   │   ├── dateFormatter.ts            # Date formatting
│   │   │   ├── currencyFormatter.ts        # Currency formatting
│   │   │   └── index.ts
│   │   ├── validators/
│   │   │   ├── emailValidator.ts           # Email validation
│   │   │   ├── passwordValidator.ts        # Password validation
│   │   │   └── index.ts
│   │   ├── helpers.ts                      # throttle, debounce utilities
│   │   └── index.ts
│   │
│   ├── constants/                 # Application constants
│   │   ├── app.constants.ts                # API_BASE_URL, PAGE_SIZE
│   │   ├── routes.constants.ts             # Route paths
│   │   ├── animation.constants.ts          # Animation presets
│   │   └── index.ts
│   │
│   ├── routes/                    # Routing configuration
│   │   ├── PrivateRoute.tsx                # Protected route HOC
│   │   ├── PublicRoute.tsx                 # Public route HOC
│   │   ├── index.tsx                       # Router config with Suspense
│   │   └── routes.config.ts                # Route definitions
│   │
│   ├── App.tsx                    # Root component
│   ├── main.tsx                   # Application entry point
│   ├── vite-env.d.ts              # Vite types
│   └── setupTests.ts              # Test setup
│
├── public/                        # Static assets
│   ├── fonts/                     # Hand-drawn fonts
│   └── images/
│
├── .gitignore
├── package.json                   # Dependencies
├── README.md                      # Project documentation
├── ARCHITECTURE.md                # This file
├── vite.config.ts                 # Vite configuration (path aliases)
├── tsconfig.json                  # TypeScript configuration
├── tsconfig.node.json             # Node TypeScript config
├── .eslintrc.json                 # ESLint rules
├── .prettierrc                    # Prettier config
├── jest.config.ts                 # Jest configuration
├── tailwind.config.js             # Tailwind CSS config
├── postcss.config.js              # PostCSS config
└── components.json                # Component registry
```

---

## 🎨 UI Component Architecture

### Component Priority & Usage

#### 1. Hand-Drawn Components (Primary - 70%)
Use **roughjs**, **react-sketch-canvas**, and **react-konva** for:
- ✅ All buttons, inputs, cards with hand-drawn borders
- ✅ Forms and form fields with sketch effect
- ✅ Product cards and lists
- ✅ Navigation elements
- ✅ Dialogs and modals
- ✅ Page layouts and containers

**Example Usage:**
```tsx
import { Button, Input, Card } from '@shared/components/HandDrawn';
import { ReactSketchCanvas } from 'react-sketch-canvas';
import rough from 'roughjs';

// Hand-drawn button with Rough.js
const HandDrawnButton = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    if (canvasRef.current) {
      const rc = rough.canvas(canvasRef.current);
      rc.rectangle(10, 10, 200, 50, {
        roughness: 2,
        fill: 'lightblue',
        fillStyle: 'hachure'
      });
    }
  }, []);
  
  return <canvas ref={canvasRef} />;
};

// Sketch canvas for drawing
<ReactSketchCanvas
  strokeWidth={4}
  strokeColor="black"
  canvasColor="white"
/>
```

#### 2. Material UI Components (Secondary - 20%)
Use `@mui/material` with `@emotion` for:
- ✅ Complex data tables
- ✅ Advanced form controls (DatePicker, Autocomplete)
- ✅ Tooltips and popovers
- ✅ Progress indicators
- ✅ Snackbars and alerts

**Example Usage:**
```tsx
import { MuiButton, MuiCard } from '@shared/components/Material';
import { DataGrid } from '@mui/material';

// Material UI wrapped with emotion
<MuiButton color="primary" variant="contained">
  Material Button
</MuiButton>
```

#### 3. Tailwind Utilities (10%)
Use for:
- ✅ Quick spacing and layout utilities
- ✅ Responsive design classes
- ✅ Color utilities

---

## 🎬 Animation Strategy

### Animation Integration (Anime.js + Framer Motion)

Components support both Anime.js and Framer Motion:

```tsx
import { FadeIn, SlideIn, DrawIn } from '@shared/components/Animations';
import { motion } from 'framer-motion';
import anime from 'animejs';

// Framer Motion animation (Recommended for React)
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6 }}
>
  <ProductCard />
</motion.div>

// Anime.js for complex animations
useEffect(() => {
  anime({
    targets: '.hand-drawn-element',
    strokeDashoffset: [anime.setDashoffset, 0],
    duration: 1500,
    easing: 'easeInOutQuad'
  });
}, []);

// Draw in animation (hand-drawn effect)
<DrawIn>
  <Button>Animated Button</Button>
</DrawIn>
```

### Animation Files Structure
Each component has an `.animations.ts` file:

```typescript
// Button.animations.ts
import anime from 'animejs';

export const buttonHoverAnimation = (target: HTMLElement) => {
  anime({
    targets: target,
    scale: 1.05,
    duration: 200,
    easing: 'easeOutQuad'
  });
};

export const buttonDrawInAnimation = (target: HTMLElement) => {
  anime({
    targets: target,
    strokeDashoffset: [anime.setDashoffset, 0],
    duration: 1000,
    easing: 'easeInOutQuad'
  });
};
```

---

## 🎯 MVC Pattern Implementation

### Model Layer
- **API calls**: React-Query hooks (`useQuery`, `useMutation`)
- **Types**: TypeScript interfaces and types
- **State**: Redux Toolkit slices

### View Layer
- **Pages**: Route-level components with hand-drawn UI
- **Components**: Reusable UI components with animations
- **Layouts**: Page structure components

### Controller Layer
- **Custom hooks**: Business logic separation
- **Form controllers**: Form state and validation
- **Fetch controllers**: Data fetching logic

---

## 📦 Component Creation Guidelines

### Creating a New Hand-Drawn Component

1. **Create component structure:**
```bash
src/shared/components/HandDrawn/MyComponent/
├── MyComponent.tsx
├── MyComponent.types.ts
├── MyComponent.styles.ts
├── MyComponent.animations.ts
├── MyComponent.test.tsx
└── index.ts
```

2. **Implement with hand-drawn style:**
```tsx
// MyComponent.tsx
import { styled } from '@emotion/styled';
import { useRough } from '@react-rough-fiber';
import anime from 'animejs';

export const MyComponent = () => {
  const rough = useRough();
  
  return (
    <StyledWrapper>
      <svg>
        {rough.rectangle(0, 0, 100, 100, {
          roughness: 2,
          fill: 'lightblue'
        })}
      </svg>
    </StyledWrapper>
  );
};
```

3. **Add animations:**
```typescript
// MyComponent.animations.ts
export const revealAnimation = {
  opacity: [0, 1],
  translateY: [20, 0],
  duration: 600,
  easing: 'easeOutQuad'
};
```

---

## 🚀 Getting Started

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

### Environment Setup

Create `.env.local`:
```env
VITE_API_BASE_URL=http://localhost:8080/api
```

---

## 🎨 Theme Configuration

### Hand-Drawn Theme
```typescript
// src/shared/theme/handDrawnTheme.ts
export const handDrawnTheme = {
  roughness: 2,
  strokeWidth: 2,
  fillWeight: 3,
  colors: {
    primary: '#4A90E2',
    secondary: '#7B68EE',
    accent: '#FF6B6B'
  },
  animations: {
    duration: 600,
    easing: 'easeOutQuad'
  }
};
```

### MUI Theme
```typescript
// src/shared/theme/muiTheme.ts
import { createTheme } from '@mui/material/styles';

export const muiTheme = createTheme({
  palette: {
    primary: { main: '#4A90E2' },
    secondary: { main: '#7B68EE' }
  }
});
```

---

## 📝 Code Style & Best Practices

### Component Guidelines
- ✅ Use hand-drawn components by default
- ✅ Add animations for user interactions
- ✅ Memoize expensive components
- ✅ Use TypeScript for type safety
- ✅ Write tests for all components
- ✅ Follow MVC separation

### File Naming
- Components: `PascalCase.tsx`
- Hooks: `useCamelCase.ts`
- Types: `camelCase.types.ts`
- Styles: `camelCase.styles.ts`
- Animations: `camelCase.animations.ts`

---

## 🧪 Testing Strategy

### Test Files
Each component, hook, and page should have corresponding test files:
- `Component.test.tsx` - Component tests
- `useHook.test.ts` - Hook tests
- `integration.test.tsx` - Integration tests

### Example Test
```typescript
import { render, screen } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders with hand-drawn style', () => {
    render(<Button>Click Me</Button>);
    expect(screen.getByText('Click Me')).toBeInTheDocument();
  });
  
  it('triggers animation on hover', () => {
    const { container } = render(<Button>Hover Me</Button>);
    // Test animation behavior
  });
});
```

---

## 🔄 State Flow

```
User Action (View)
    ↓
Controller Hook (useController)
    ↓
API Call (React-Query) / Redux Action
    ↓
Model Update (Redux Slice / Cache)
    ↓
View Re-render (with Animation)
```

---

## 📚 Additional Resources

- [Rough.js Documentation](https://roughjs.com/) - Hand-drawn graphics
- [React Sketch Canvas](https://github.com/vinothpandian/react-sketch-canvas) - Canvas sketching
- [React Konva](https://konvajs.org/docs/react/) - Canvas framework
- [Anime.js Documentation](https://animejs.com/) - Animation library
- [Framer Motion](https://www.framer.com/motion/) - React animations
- [MUI Documentation](https://mui.com/) - Material UI
- [Emotion](https://emotion.sh/docs/introduction) - CSS-in-JS

---

## 👥 Contributing

1. Follow the MVC pattern
2. Use hand-drawn components first
3. Add animations for better UX
4. Write TypeScript types
5. Write tests
6. Document your code

---

## 🆕 Layout Implementation Status (October 23, 2025)

### ✅ Completed Features

#### 1. **MainLayout System**
- ✅ Responsive layout with sidebar + header
- ✅ Collapsible sidebar (desktop)
- ✅ Mobile-friendly with overlay
- ✅ Smooth animations with Framer Motion
- ✅ Gradient background (blue-purple)

#### 2. **Sidebar Component**
- ✅ Navigation groups (Repositories, Management, Administration)
- ✅ Active route highlighting
- ✅ Pin/unpin functionality (local storage)
- ✅ Icons with Lucide React
- ✅ Collapsed mode support

#### 3. **Header Component**
- ✅ Search bar (center)
- ✅ Notifications badge
- ✅ User dropdown menu
- ✅ Mobile responsive
- ✅ Sticky positioning

#### 4. **Layout Variants**
- ✅ `DashboardLayout` - Full layout with sidebar/header
- ✅ `AuthLayout` - Clean layout for login/register
- ✅ `MainLayout` - Base layout with customization

### 🎨 UI Features
- **Animations**: Framer Motion for smooth transitions
- **Icons**: Lucide React (lightweight, tree-shakable)
- **Styling**: Tailwind CSS + Gradient backgrounds
- **Responsive**: Mobile-first design
- **State**: LocalStorage for sidebar preferences

### 📝 Usage Example

```tsx
// Dashboard pages
import { DashboardLayout } from '@shared/layouts';

export const ProductList = () => {
  return (
    <DashboardLayout>
      <h1>My Products</h1>
      {/* Your content */}
    </DashboardLayout>
  );
};

// Auth pages
import { AuthLayout } from '@shared/layouts';

export const Login = () => {
  return (
    <AuthLayout>
      <LoginForm />
    </AuthLayout>
  );
};
```

### 🎨 **Component Library Status**

#### ✅ **Completed Components:**
- Hand-Drawn UI: Button, Input, Card (with subcomponents)
- Sketch Tools: SketchBox, SketchCircle, SketchLine
- Animations: FadeIn, SlideIn, Bounce, DrawIn, useAnimation hook
- Layouts: Container, Grid, Stack, MainLayout, DashboardLayout, AuthLayout
- Pages: Dashboard, Login, Register, ForgotPassword, ProductList, ProductDetail, ProductEdit, OrderList, OrderDetail

#### ✅ **Utilities Implemented:**
- **Utils**: cn (Tailwind merge), formatCurrency, formatDate
- **Rough.js**: createRoughCanvas, drawRoughRect, drawRoughCircle, drawRoughEllipse, drawRoughLine, drawRoughPolygon, drawRoughPath, roughPresets
- **Animation**: createStagger, createSpring, createTween, fade/slide/scale/rotate variants, hover/tap effects, sequential/parallel helpers
- **Theme**: handDrawnTheme (colors, spacing, typography, shadows), muiTheme, animation presets
- **Constants**: Routes, API configs

### 🚀 Next Steps (Future Implementation)
- [ ] Add hand-drawn borders to sidebar navigation items
- [ ] Implement anime.js path animations
- [ ] Integrate with authentication system
- [ ] Add notification system (toast/alert)
- [ ] Implement search functionality
- [ ] Add user profile management
- [ ] Connect to backend APIs
- [ ] Add loading skeletons with hand-drawn style

---

**Last Updated:** October 23, 2025
