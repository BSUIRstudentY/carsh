import { Outlet } from 'react-router-dom'
import { ApiStatusBar } from '../components/dev/ApiStatusBar'
import './guest-shell.css'

export function GuestShell() {
  return (
    <div className="app">
      <Outlet />
      <ApiStatusBar />
    </div>
  )
}
