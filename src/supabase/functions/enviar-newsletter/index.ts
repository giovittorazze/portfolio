import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Cabeçalhos para liberar a política de CORS para o seu site
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // 1. Trata a requisição de pré-checagem (preflight/OPTIONS) enviada pelo navegador
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { assunto, mensagem, linkObra } = await req.json()

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!RESEND_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'Chave RESEND_API_KEY não configurada nos secrets do Supabase.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Instancia o cliente admin do Supabase
    const supabaseAdmin = createClient(
      SUPABASE_URL ?? '',
      SUPABASE_SERVICE_ROLE_KEY ?? ''
    )

    // 2. Busca os e-mails cadastrados
    const { data: inscritos, error: dbError } = await supabaseAdmin
      .from('newsletter_inscritos')
      .select('email')

    if (dbError || !inscritos || inscritos.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Nenhum e-mail inscrito encontrado.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const destinatarios = inscritos.map((item) => item.email)

    // 3. Dispara via Resend
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Atelier <onboarding@resend.dev>',
        to: destinatarios,
        subject: assunto,
        html: `
          <div style="font-family: sans-serif; color: #333; padding: 20px;">
            <h2 style="color: #7c3aed;">Novidade no Atelier de Giovanni Vittorazze!</h2>
            <p>${mensagem}</p>
            ${linkObra ? `<p><a href="${linkObra}" style="background: #7c3aed; color: white; padding: 10px 20px; text-decoration: none; border-radius: 8px; display: inline-block;">Ver Nova Obra</a></p>` : ''}
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="font-size: 11px; color: #777;">Você está recebendo este e-mail porque se inscreveu no site do artista.</p>
          </div>
        `,
      }),
    })

    const data = await res.json()

    return new Response(JSON.stringify({ success: true, data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})