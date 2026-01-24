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
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error('User not authenticated');
    }

    const { amount } = await req.json();
    
    const MINIMUM_DEPOSIT = 20;
    
    if (!amount || amount < MINIMUM_DEPOSIT) {
      throw new Error(`O depósito mínimo é de R$ ${MINIMUM_DEPOSIT},00`);
    }

    const accessToken = Deno.env.get('MERCADO_PAGO_ACCESS_TOKEN');
    if (!accessToken) {
      throw new Error('Mercado Pago not configured');
    }

    const externalReference = `pix_${user.id}_${Date.now()}`;
    
    // Create PIX payment in Mercado Pago
    const mpResponse = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': externalReference,
      },
      body: JSON.stringify({
        transaction_amount: Number(amount),
        description: `Saldo - EsteliO MUCA`,
        payment_method_id: 'pix',
        payer: {
          email: user.email,
        },
        external_reference: externalReference,
        notification_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/mercadopago-webhook`,
      }),
    });

    const mpData = await mpResponse.json();
    console.log('Mercado Pago response:', JSON.stringify(mpData));

    if (!mpResponse.ok) {
      console.error('Mercado Pago error:', mpData);
      throw new Error(mpData.message || 'Failed to create payment');
    }

    // Save payment to database
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: payment, error: insertError } = await supabaseAdmin
      .from('pix_payments')
      .insert({
        user_id: user.id,
        amount: amount,
        external_reference: externalReference,
        mercado_pago_id: mpData.id?.toString(),
        status: 'pending',
        qr_code: mpData.point_of_interaction?.transaction_data?.qr_code,
        qr_code_base64: mpData.point_of_interaction?.transaction_data?.qr_code_base64,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Database error:', insertError);
      throw new Error('Failed to save payment');
    }

    return new Response(JSON.stringify({
      success: true,
      payment: {
        id: payment.id,
        external_reference: externalReference,
        qr_code: mpData.point_of_interaction?.transaction_data?.qr_code,
        qr_code_base64: mpData.point_of_interaction?.transaction_data?.qr_code_base64,
        amount: amount,
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('Error:', errorMessage);
    return new Response(JSON.stringify({ 
      success: false, 
      error: errorMessage 
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
