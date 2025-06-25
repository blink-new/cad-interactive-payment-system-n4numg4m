import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from 'react-hot-toast'

interface User {
  id: string;
  email: string | undefined;
  balance: number;
  referral_code: string;
}

interface Payout {
  id: string;
  amount: number;
  email: string;
  status: string;
  created_at: string;
}

interface UserFromSupabase {
  id: string;
  balance: number;
  referral_code: string;
  user_id: { email: string };
}

export function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([])
  const [payouts, setPayouts] = useState<Payout[]>([])

  useEffect(() => {
    const fetchUsers = async () => {
      const { data: usersData, error } = await supabase.from('profiles').select(`
        id,
        balance,
        referral_code,
        user_id ( email )
      `)

      if (error) {
        toast.error('Failed to load users')
      } else {
        const formattedUsers = usersData.map((user: UserFromSupabase) => ({
          id: user.id,
          email: user.user_id.email,
          balance: user.balance,
          referral_code: user.referral_code,
        }))
        setUsers(formattedUsers)
      }
    }

    const fetchPayouts = async () => {
      const { data: payoutsData, error } = await supabase
        .from('payouts')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        toast.error('Failed to load payouts')
      } else {
        setPayouts(payoutsData)
      }
    }

    fetchUsers()
    fetchPayouts()
  }, [])

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Admin Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Welcome, admin! This is where you'll manage users and payouts.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Referral Code</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>${user.balance.toFixed(2)}</TableCell>
                  <TableCell>{user.referral_code}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payout Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payouts.map((payout) => (
                <TableRow key={payout.id}>
                  <TableCell>{payout.email}</TableCell>
                  <TableCell>${payout.amount.toFixed(2)}</TableCell>
                  <TableCell>{payout.status}</TableCell>
                  <TableCell>{new Date(payout.created_at).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}