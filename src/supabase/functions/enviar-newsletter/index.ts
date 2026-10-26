// supabase/functions/enviar-newsletter/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

serve(async (req) => {
  try {
    const { assunto, mensagem, linkObra } = await req.json()

    // Conexão com o Supabase usando as chaves de serviço
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 1. Busca todos os e-mails dos inscritos
    const { data: inscritos, error } = await supabaseAdmin
      .from('newsletter_inscritos')
      .select('email')

    if (error || !inscritos || inscritos.length === 0) {
      return new Response(JSON.stringify({ error: 'Nenhum inscrito encontrado.' }), { status: 400 })
    }

    const destinatarios = inscritos.map(item => item.email)

    // 2. Dispara o e-mail usando a API do Resend (envio em lote)
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Atelier <onboarding@resend.dev>', // Seu domínio verificado no Resend
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
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
})