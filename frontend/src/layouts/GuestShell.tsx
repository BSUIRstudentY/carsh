import { Outlet } from 'react-router-dom'
import { ApiStatusBar } from '../components/dev/ApiStatusBar'
import { ActiveRideWidget } from '../components/ActiveRideWidget'
import { NotificationManager } from '../components/NotificationManager'
import './guest-shell.css'

export function GuestShell() {
  return (
    <div className="app">
      <Outlet />
      <ActiveRideWidget />
      <NotificationManager />
      <ApiStatusBar />
    </div>
  )
}
