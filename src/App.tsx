import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from 'next-themes'
import { Dashboard } from './components/Dashboard'
import { PaymentForm } from './components/PaymentForm'
import { TransactionHistory } from './components/TransactionHistory'
import { Navigation } from './components/Navigation'
import { Header } from './components/Header'
import { Login } from './components/Login'
import { AdminDashboard } from './components/AdminDashboard'
import { supabase } from './lib/supabaseClient'
import { Session } from '@supabase/supabase-js'

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('user_id', user.id)
          .single()

        if (profile?.is_admin) {
          setIsAdmin(true)
        }
      }
      setLoading(false)
    }
    checkAdmin()
  }, [])

  if (loading) {
    return <div>Loading...</div>
  }

  return isAdmin ? <>{children}</> : <Navigate to="/" />
}

function App() {
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <ThemeProvider defaultTheme="light" attribute="class">
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
          {session && <Header />}
          <div className={session ? "flex" : ""}>
            {session && <Navigation />}
            <main className="flex-1 p-6">
              <div className="max-w-7xl mx-auto">
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route 
                    path="/" 
                    element={session ? <Dashboard /> : <Navigate to="/login" />}
                  />
                  <Route 
                    path="/payment" 
                    element={session ? <PaymentForm /> : <Navigate to="/login" />}
                  />
                  <Route 
                    path="/transactions" 
                    element={session ? <TransactionHistory /> : <Navigate to="/login" />}
                  />
                  <Route 
                    path="/admin" 
                    element={
                      <AdminRoute>
                        <AdminDashboard />
                      </AdminRoute>
                    }
                  />
                </Routes>
              </div>
            </main>
          </div>
        </div>
      </Router>
    </ThemeProvider>
  )
}

export default App