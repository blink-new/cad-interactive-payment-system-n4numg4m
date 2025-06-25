import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ArrowUpRight, DollarSign, Users, Clock, Copy } from 'lucide-react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabaseClient'
import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'

interface Profile {
  id: string;
  user_id: string;
  balance: number;
  referral_code: string;
  referred_by: string | null;
}

interface Payout {
  id: string;
  user_id: string;
  amount: number;
  email: string;
  status: string;
  created_at: string;
}

export function Dashboard() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [payouts, setPayouts] = useState<Payout[]>([])

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (error) {
          toast.error('Failed to load profile data')
          console.error(error)
        } else {
          setProfile(profileData)
        }
      }
    }

    const fetchPayouts = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: payoutsData, error } = await supabase
          .from('payouts')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (error) {
          toast.error('Failed to load payouts')
          console.error(error)
        } else {
          setPayouts(payoutsData)
        }
      }
    }

    fetchProfile()
    fetchPayouts()

    const payoutListener = supabase.channel('custom-all-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'payouts' },
        () => {
          fetchPayouts() 
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(payoutListener)
    }
  }, [])

  const stats = [
    {
      title: 'Your Balance',
      value: `CAD $${profile?.balance?.toFixed(2) || '0.00'}`,
      icon: DollarSign,
    },
    {
      title: 'Referral Code',
      value: profile?.referral_code || 'Loading...',
      icon: Users,
    },
    {
      title: 'Total Payouts',
      value: payouts.length,
      icon: Clock,
    },
  ]

  const copyReferralCode = () => {
    if (profile?.referral_code) {
      navigator.clipboard.writeText(profile.referral_code)
      toast.success('Referral code copied to clipboard!')
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your payments today.</p>
        </div>
        <Link to="/payment">
          <Button className="bg-red-600 hover:bg-red-700">
            <ArrowUpRight className="w-4 h-4 mr-2" />
            Request Payout
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="border-0 shadow-sm bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center">
                  {stat.title === 'Referral Code' ? (
                    <Button variant="ghost" size="icon" onClick={copyReferralCode}>
                      <Copy className="w-6 h-6 text-red-600" />
                    </Button>
                  ) : (
                    <stat.icon className="w-6 h-6 text-red-600" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Recent Payouts</span>
                <Link to="/transactions">
                  <Button variant="ghost" size="sm">
                    View all
                    <ArrowUpRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {payouts.length > 0 ? (
                  payouts.map((payout) => (
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
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-8">No payout requests yet.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Status */}
        <div className="space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>System Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">API Response Time</span>
                    <span className="text-green-600 font-medium">98%</span>
                  </div>
                  <Progress value={98} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Success Rate</span>
                    <span className="text-green-600 font-medium">99.2%</span>
                  </div>
                  <Progress value={99.2} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">System Uptime</span>
                    <span className="text-green-600 font-medium">99.9%</span>
                  </div>
                  <Progress value={99.9} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Link to="/payment">
                  <Button className="w-full justify-start" variant="outline">
                    <DollarSign className="w-4 h-4 mr-2" />
                    Request Payout
                  </Button>
                </Link>
                <Button className="w-full justify-start" variant="outline">
                  <Users className="w-4 h-4 mr-2" />
                  Manage Referrals
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}