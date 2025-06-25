import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'react-hot-toast'

interface Payout {
  id: string;
  user_id: string;
  amount: number;
  email: string;
  status: string;
  created_at: string;
}

export function TransactionHistory() {
  const [payouts, setPayouts] = useState<Payout[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPayouts = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: payoutsData, error } = await supabase
          .from('payouts')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (error) {
          toast.error('Failed to load transactions')
          console.error(error)
        } else {
          setPayouts(payoutsData)
        }
      }
      setLoading(false)
    }

    fetchPayouts()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction History</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p>Loading...</p>
        ) : payouts.length > 0 ? (
          <div className="space-y-4">
            {payouts.map((payout) => (
              <div key={payout.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className={`w-2 h-2 rounded-full ${
                    payout.status === 'completed' ? 'bg-green-500' : payout.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                  }`} />
                  <div>
                    <p className="font-medium text-gray-900">CAD ${payout.amount}</p>
                    <p className="text-sm text-gray-500">To: {payout.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-medium capitalize ${
                    payout.status === 'completed' ? 'text-green-600' : payout.status === 'pending' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {payout.status}
                  </p>
                  <p className="text-sm text-gray-500">{new Date(payout.created_at).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No transactions yet.</p>
        )}
      </CardContent>
    </Card>
  )
}