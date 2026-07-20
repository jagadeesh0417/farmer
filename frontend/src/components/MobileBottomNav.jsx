import { NavLink } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { HomeIcon, ProductsIcon, CombosIcon, AboutIcon } from './Icons'

export default function MobileBottomNav() {
  const { user } = useAuth()
  const btn = 'flex flex-1 flex-col items-center justify-center rounded-xl py-2 text-[9px] font-semibold tracking-[0.08em] uppercase transition-all'
  const activeBtn = 'bg-cream-100 text-forest-900'
  const inactiveBtn = 'text-forest-900/40 hover:text-forest-900/70 hover:bg-cream-50'

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border-warm bg-cream-50/98 shadow-[0_-4px_24px_rgba(0,0,0,0.06)] backdrop-blur-xl md:hidden">
      <div className="flex items-center justify-around px-2 pb-[max(0.25rem,env(safe-area-inset-bottom))] pt-1.5">
        <NavLink to="/" end className={({ isActive }) => `${btn} ${isActive ? activeBtn : inactiveBtn}`}>
          <span className="mb-0.5 inline-flex h-7 w-7 items-center justify-center"><HomeIcon className="h-4.5 w-4.5" /></span>
          <span>HOME</span>
        </NavLink>
        <NavLink to="/products" className={({ isActive }) => `${btn} ${isActive ? activeBtn : inactiveBtn}`}>
          <span className="mb-0.5 inline-flex h-7 w-7 items-center justify-center"><ProductsIcon className="h-4.5 w-4.5" /></span>
          <span>PRODUCTS</span>
        </NavLink>
        <NavLink to="/combos" className={({ isActive }) => `${btn} ${isActive ? activeBtn : inactiveBtn}`}>
          <span className="mb-0.5 inline-flex h-7 w-7 items-center justify-center"><CombosIcon className="h-4.5 w-4.5" /></span>
          <span>COMBOS</span>
        </NavLink>
        <NavLink to="/about" className={({ isActive }) => `${btn} ${isActive ? activeBtn : inactiveBtn}`}>
          <span className="mb-0.5 inline-flex h-7 w-7 items-center justify-center"><AboutIcon className="h-4.5 w-4.5" /></span>
          <span>ABOUT</span>
        </NavLink>
        {user && (
          <NavLink to="/account" className={({ isActive }) => `${btn} ${isActive ? activeBtn : inactiveBtn}`}>
            <span className="mb-0.5 inline-flex h-7 w-7 items-center justify-center"><AboutIcon className="h-4.5 w-4.5" /></span>
            <span>ACCOUNT</span>
          </NavLink>
        )}
      </div>
    </nav>
  )
}
