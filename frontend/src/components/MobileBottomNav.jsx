import { NavLink } from 'react-router-dom'
import { HomeIcon, ProductsIcon, CombosIcon, AboutIcon } from './Icons'

export default function MobileBottomNav() {
  const btn = 'flex flex-1 flex-col items-center justify-center rounded-xl py-2 text-[10px] font-semibold tracking-[0.06em] uppercase transition-all'
  const activeBtn = 'bg-green-50 text-green-600'
  const inactiveBtn = 'text-muted hover:text-green-600 hover:bg-green-50'

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-white/98 shadow-[0_-4px_12px_rgba(0,0,0,0.04)] backdrop-blur-xl md:hidden">
      <div className="flex items-center justify-around px-2 pb-[max(0.25rem,env(safe-area-inset-bottom))] pt-2">
        <NavLink to="/" end className={({ isActive }) => `${btn} ${isActive ? activeBtn : inactiveBtn}`}>
          <span className="mb-0.5 inline-flex h-7 w-7 items-center justify-center"><HomeIcon className="h-5 w-5" /></span>
          <span>HOME</span>
        </NavLink>
        <NavLink to="/products" className={({ isActive }) => `${btn} ${isActive ? activeBtn : inactiveBtn}`}>
          <span className="mb-0.5 inline-flex h-7 w-7 items-center justify-center"><ProductsIcon className="h-5 w-5" /></span>
          <span>PRODUCTS</span>
        </NavLink>
        <NavLink to="/combos" className={({ isActive }) => `${btn} ${isActive ? activeBtn : inactiveBtn}`}>
          <span className="mb-0.5 inline-flex h-7 w-7 items-center justify-center"><CombosIcon className="h-5 w-5" /></span>
          <span>COMBOS</span>
        </NavLink>
        <NavLink to="/about" className={({ isActive }) => `${btn} ${isActive ? activeBtn : inactiveBtn}`}>
          <span className="mb-0.5 inline-flex h-7 w-7 items-center justify-center"><AboutIcon className="h-5 w-5" /></span>
          <span>ABOUT</span>
        </NavLink>

      </div>
    </nav>
  )
}
