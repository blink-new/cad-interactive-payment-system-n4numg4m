import { Link, useLocation } from 'react-router-dom'
import { BarChart3, CreditCard, History, Home } from 'lucide-react'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'New Payment', href: '/payment', icon: CreditCard },
  { name: 'Transactions', href: '/transactions', icon: History },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
]

export function Navigation() {
  const location = useLocation()

  return (
    <nav className="w-64 bg-white border-r h-screen sticky top-16 overflow-y-auto">
      <div className="p-6">
        <div className="space-y-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group',
                  isActive
                    ? 'bg-red-50 text-red-700 border border-red-200'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                <item.icon 
                  className={cn(
                    'w-5 h-5 transition-colors',
                    isActive ? 'text-red-600' : 'text-gray-400 group-hover:text-gray-600'
                  )} 
                />
                <span className="font-medium">{item.name}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}