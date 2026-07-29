import { NavLink } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'
import { HomeIcon, ProductsIcon, CombosIcon, AboutIcon, CartIcon } from './Icons'

export default function MobileBottomNav() {
  const { itemCount } = useCart()
  const btn = 'relative flex flex-1 flex-col items-center justify-center rounded-xl py-2 text-micro font-semibold tracking-[0.06em] uppercase transition-all'
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
        <NavLink to="/cart" className={({ isActive }) => `${btn} ${isActive ? activeBtn : inactiveBtn}`}>
          <span className="mb-0.5 inline-flex h-7 w-7 items-center justify-center relative">
            <CartIcon className="h-5 w-5" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 flex items-center justify-center rounded-full bg-green-600 min-w-[16px] h-[16px] px-0.5 text-[9px] font-bold text-white shadow-sm leading-none">
                {itemCount > 99 ? '99+' : itemCount}
              </span>
            )}
          </span>
          <span>CART</span>
        </NavLink>
        <NavLink to="/about" className={({ isActive }) => `${btn} ${isActive ? activeBtn : inactiveBtn}`}>
          <span className="mb-0.5 inline-flex h-7 w-7 items-center justify-center"><AboutIcon className="h-5 w-5" /></span>
          <span>ABOUT</span>
        </NavLink>
      </div>
    </nav>
  )
}
