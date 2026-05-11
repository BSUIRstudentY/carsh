import { createBrowserRouter } from 'react-router-dom'
import { GuestShell } from '../layouts/GuestShell'
import { AboutPage } from '../pages/about/AboutPage'
import { LoginPage } from '../pages/auth/LoginPage'
import { RegisterPage } from '../pages/auth/RegisterPage'
import { ContactPage } from '../pages/contact/ContactPage'
import { FleetPage } from '../pages/fleet/FleetPage'
import { HomePage } from '../pages/home/HomePage'
import { MapPage } from '../pages/map/MapPage'
import { TariffsPage } from '../pages/tariffs/TariffsPage'
import { AdminPage } from '../pages/admin/AdminPage'
import { DashboardPage } from '../pages/dashboard/DashboardPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <GuestShell />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'fleet', element: <FleetPage /> },
      { path: 'map', element: <MapPage /> },
      { path: 'tariffs', element: <TariffsPage /> },
      { path: 'about', element: <AboutPage /> },
      { path: 'contact', element: <ContactPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      { path: 'dashboard', element: <DashboardPage /> },
    ],
  },
  {
    path: '/admin',
    element: <AdminPage />,
  },
])
