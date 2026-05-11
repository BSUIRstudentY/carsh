import type { ReactNode } from 'react'
import { PublicFooter } from '../components/public/PublicFooter'
import { PublicHeader } from '../components/public/PublicHeader'
import '../components/public/public-layout.css'

type PublicPageShellProps = {
  children: ReactNode
}

/** Внутренняя страница: та же шапка/футер/фон, что и у гостевого сайта. */
export function PublicPageShell({ children }: PublicPageShellProps) {
  return (
    <div className="page-shell">
      <PublicHeader variant="default" />
      <main className="page-main">{children}</main>
      <PublicFooter />
    </div>
  )
}
