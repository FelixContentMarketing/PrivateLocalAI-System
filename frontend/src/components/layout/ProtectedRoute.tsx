import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../lib/auth'
import { Spinner } from '../atoms/Spinner'

export function ProtectedRoute() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-dark">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
