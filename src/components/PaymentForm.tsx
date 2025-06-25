import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

export function PaymentForm() {
  const [email, setEmail] = useState('')
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [balance, setBalance] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('balance')
          .eq('user_id', user.id)
          .single()

        if (error) {
          toast.error('Failed to load profile data')
          console.error(error)
        } else {
          setBalance(profileData.balance)
        }
      }
    }
    fetchProfile()
  }, [])

  const handleRequestPayout = async (e: React.FormEvent) => {
    e.preventDefault()
    const payoutAmount = parseFloat(amount)

    if (payoutAmount > balance) {
      toast.error('Insufficient funds')
      return
    }

    if (payoutAmount < 20) {
      toast.error('Minimum payout is $20')
      return
    }

    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { error } = await supabase.from('payouts').insert([
        { user_id: user.id, email, amount: payoutAmount },
      ])

      if (error) {
        toast.error('Failed to request payout')
        console.error(error)
      } else {
        toast.success('Payout requested successfully!')
        // Optimistically update balance
        const newBalance = balance - payoutAmount
        setBalance(newBalance)
        await supabase.from('profiles').update({ balance: newBalance }).eq('user_id', user.id)
        navigate('/')
      }
    }
    setLoading(false)
  }

  return (
    <div className="flex items-center justify-center">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Request Payout</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRequestPayout} className="space-y-4">
            <p className="text-center text-lg font-medium">Your balance: ${balance.toFixed(2)}</p>
            <Input
              type="email"
              placeholder="Interac E-Transfer Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              type="number"
              placeholder="Amount (CAD)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              min="20"
              step="0.01"
            />
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Requesting...' : 'Request Payout'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
