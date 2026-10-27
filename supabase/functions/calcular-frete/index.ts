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
    const { cepDestino, itens } = await req.json();

    // Consulta ViaCEP
    const resCep = await fetch(`https://viacep.com.br/ws/${cepDestino}/json/`);
    const dadosCep = await resCep.json();

    if (dadosCep.erro) {
      return new Response(JSON.stringify({ erro: 'CEP inválido' }), { status: 400 });
    }

    const ehSudeste = ['SP', 'RJ', 'MG', 'ES'].includes(dadosCep.uf);
    const ehSulCentroOeste = ['PR', 'SC', 'RS', 'GO', 'DF', 'MS', 'MT'].includes(dadosCep.uf);

    let precoPac = ehSudeste ? 24.90 : ehSulCentroOeste ? 36.50 : 49.90;
    let precoSedex = ehSudeste ? 34.90 : ehSulCentroOeste ? 58.00 : 79.90;

    const qtd = Array.isArray(itens) ? itens.length : 1;
    if (qtd > 1) {
      const adicional = (qtd - 1) * 8.50;
      precoPac += adicional;
      precoSedex += adicional * 1.3;
    }

    const opcoes = [
      { id: 'pac', nome: 'Correios PAC', valor: precoPac, prazo: ehSudeste ? '4 a 6 dias úteis' : '7 a 12 dias úteis' },
      { id: 'sedex', nome: 'Correios SEDEX', valor: precoSedex, prazo: ehSudeste ? '1 a 2 dias úteis' : '3 a 5 dias úteis' }
    ];

    return new Response(JSON.stringify({ opcoes }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      status: 200
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ erro: err.message }), { status: 500 });
  }
});