import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const { referral_code, new_user_id } = await req.json()

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  )

  // Find the referrer
  const { data: referrer, error: referrerError } = await supabase
    .from('profiles')
    .select('id, balance')
    .eq('referral_code', referral_code)
    .single()

  if (referrerError || !referrer) {
    return new Response(JSON.stringify({ error: 'Invalid referral code' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 400,
    })
  }

  // Update the new user's profile with the referrer and bonus
  const { error: newUserError } = await supabase
    .from('profiles')
    .update({ referred_by: referrer.id, balance: 20 })
    .eq('user_id', new_user_id)

  if (newUserError) {
    return new Response(JSON.stringify({ error: 'Failed to update new user' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    })
  }

  // Update the referrer's balance
  const { error: referrerBalanceError } = await supabase
    .from('profiles')
    .update({ balance: referrer.balance + 20 })
    .eq('id', referrer.id)

  if (referrerBalanceError) {
    return new Response(JSON.stringify({ error: 'Failed to update referrer balance' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    })
  }

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
