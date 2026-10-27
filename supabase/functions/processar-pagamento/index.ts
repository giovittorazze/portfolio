// @ts-nocheck
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      }
    });
  }

  try {
    const body = await req.json();
    console.log("Payload recebido do front-end:", JSON.stringify(body));

    const { formData } = body;

    const token = Deno.env.get("MP_ACCESS_TOKEN");
    if (!token) {
      console.error("ERRO CRÍTICO: MP_ACCESS_TOKEN não está configurado no Supabase!");
      return new Response(JSON.stringify({ erro: "Token do Mercado Pago não configurado no servidor." }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        status: 500
      });
    }

    const respostaMP = await fetch("https://api.mercadopago.com/v1/payments", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
        "X-Idempotency-Key": crypto.randomUUID()
      },
      body: JSON.stringify(formData)
    });

    const dadosPagamento = await respostaMP.json();
    console.log("Resposta bruta do Mercado Pago:", JSON.stringify(dadosPagamento));

    if (
      dadosPagamento.status === 'approved' || 
      dadosPagamento.status === 'pending' || 
      dadosPagamento.status_detail === 'pending_waiting_transfer'
    ) {
      return new Response(JSON.stringify({ 
        sucesso: true, 
        status: dadosPagamento.status,
        qr_code: dadosPagamento.point_of_interaction?.transaction_data?.qr_code,
        qr_code_base64: dadosPagamento.point_of_interaction?.transaction_data?.qr_code_base64,
        ticket_url: dadosPagamento.point_of_interaction?.transaction_data?.ticket_url,
        dados: dadosPagamento 
      }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        status: 200
      });
    } else {
      console.error("Mercado Pago rejeitou o pagamento:", dadosPagamento);
      return new Response(JSON.stringify({ 
        sucesso: false, 
        erro: dadosPagamento.message || dadosPagamento.status_detail || 'Pagamento recusado pelo Mercado Pago' 
      }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        status: 400
      });
    }
  } catch (erro: any) {
    console.error("Exceção capturada na Edge Function:", erro.message);
    return new Response(JSON.stringify({ erro: erro.message }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      status: 500
    });
  }
});