import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    console.log('Webhook received:', JSON.stringify(body));

    // Handle payment notification
    if (body.type === 'payment' && body.data?.id) {
      const accessToken = Deno.env.get('MERCADO_PAGO_ACCESS_TOKEN');
      
      // Get payment details from Mercado Pago
      const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${body.data.id}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      const mpPayment = await mpResponse.json();
      console.log('Payment details:', JSON.stringify(mpPayment));

      if (mpPayment.status === 'approved') {
        const supabaseAdmin = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        // Find the payment by external reference
        const { data: pixPayment, error: findError } = await supabaseAdmin
          .from('pix_payments')
          .select('*')
          .eq('external_reference', mpPayment.external_reference)
          .single();

        if (findError || !pixPayment) {
          console.error('Payment not found:', findError);
          return new Response(JSON.stringify({ received: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Check if already processed
        if (pixPayment.status === 'approved') {
          console.log('Payment already processed');
          return new Response(JSON.stringify({ received: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Update payment status
        const { error: updatePaymentError } = await supabaseAdmin
          .from('pix_payments')
          .update({ 
            status: 'approved',
            paid_at: new Date().toISOString(),
          })
          .eq('id', pixPayment.id);

        if (updatePaymentError) {
          console.error('Error updating payment:', updatePaymentError);
        }

        // Get current balance
        const { data: balanceData, error: balanceError } = await supabaseAdmin
          .from('user_balances')
          .select('balance')
          .eq('user_id', pixPayment.user_id)
          .single();

        if (balanceError) {
          console.error('Error getting balance:', balanceError);
          throw new Error('Failed to get user balance');
        }

        const newBalance = (balanceData?.balance || 0) + Number(pixPayment.amount);

        // Update user balance
        const { error: updateBalanceError } = await supabaseAdmin
          .from('user_balances')
          .update({ balance: newBalance })
          .eq('user_id', pixPayment.user_id);

        if (updateBalanceError) {
          console.error('Error updating balance:', updateBalanceError);
          throw new Error('Failed to update balance');
        }

        console.log(`Balance updated for user ${pixPayment.user_id}: +${pixPayment.amount}`);
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('Webhook error:', errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
