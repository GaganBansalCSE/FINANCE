# Finance Dashboard Frontend

A modern React 18 frontend for the Finance Dashboard application built with Vite, Tailwind CSS, and shadcn/ui components.

## Features

- **Authentication**: Login and registration with JWT tokens
- **Role-based Access**: Different permissions for viewers, analysts, and admins
- **Dashboard**: Financial overview with summary cards and charts
- **Records Management**: Create, view, edit, and delete financial records
- **Analytics**: Advanced charts and insights (analyst/admin only)
- **User Management**: Manage users and permissions (admin only)
- **Profile**: View account information and role permissions
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **React 18** - Modern React with hooks
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - High-quality UI components
- **Recharts** - Charting library for analytics
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **Lucide React** - Beautiful icons

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp .env.example .env
```

3. Update the API URL in `.env` if needed:
```
VITE_API_URL=http://localhost:5000
```

### Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Build

Build for production:
```bash
npm run build
```

### Preview

Preview the production build:
```bash
npm run preview
```

## Project Structure

```
src/
├── components/          # Reusable components
│   ├── ui/             # shadcn/ui components
│   ├── Layout.jsx      # Main layout wrapper
│   ├── Sidebar.jsx     # Navigation sidebar
│   └── ProtectedRoute.jsx # Route protection
├── contexts/           # React contexts
│   └── AuthContext.jsx # Authentication context
├── lib/               # Utility libraries
│   ├── api.js         # Axios configuration
│   └── utils.js       # Helper functions
├── pages/             # Page components
│   ├── Login.jsx      # Login page
│   ├── Register.jsx   # Registration page
│   ├── Dashboard.jsx  # Main dashboard
│   ├── Records.jsx    # Records management
│   ├── Analytics.jsx  # Charts and analytics
│   ├── Users.jsx      # User management
│   └── Profile.jsx    # User profile
├── App.jsx            # Main app component
└── main.jsx           # Entry point
```

## User Roles

### Viewer
- View dashboard and summary data
- View financial records
- View own profile

### Analyst  
- All viewer permissions
- Create new financial records
- Access analytics and charts
- View detailed trends and insights

### Admin
- All analyst permissions  
- Edit and delete any records
- Manage users and permissions
- Full system access

## API Integration

The frontend communicates with a REST API backend. Key endpoints:

- `POST /api/auth/login` - User authentication
- `POST /api/auth/register` - User registration  
- `GET /api/dashboard/summary` - Dashboard summary data
- `GET /api/records` - Financial records with filtering
- `POST /api/records` - Create new record
- `GET /api/users` - User management (admin only)

## Environment Variables

- `VITE_API_URL` - Backend API base URL (default: http://localhost:5000)

## Design System

The application uses a clean, professional design with:

- **Colors**: Indigo primary, green for income, red for expenses
- **Typography**: Inter font family via Tailwind defaults
- **Components**: shadcn/ui component library
- **Layout**: Responsive sidebar navigation
- **Theme**: Light theme with subtle shadows and borders

## Contributing

1. Follow the existing code style and patterns
2. Use TypeScript-style JSDoc comments for complex functions
3. Ensure all components are responsive
4. Test with different user roles
5. Maintain consistent error handling

## License

This project is part of the Finance Dashboard application.
