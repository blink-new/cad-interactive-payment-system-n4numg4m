import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from 'next-themes'
import { Dashboard } from './components/Dashboard'
import { PaymentForm } from './components/PaymentForm'
import { TransactionHistory } from './components/TransactionHistory'
import { Navigation } from './components/Navigation'
import { Header } from './components/Header'
import { Login } from './components/Login'
import { supabase } from './lib/supabaseClient'
import { Session } from '@supabase/supabase-js'

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