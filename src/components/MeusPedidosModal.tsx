import type { Arte } from '../types';

export interface Pedido {
  id: string;
  created_at: string;
  user_id: string;
  itens: Arte[];
  valor_total: number;
  valor_frete?: number;
  tipo_frete?: string;
  cep_entrega?: string;
  endereco_completo?: {
    logradouro?: string;
    numero?: string;
    complemento?: string;
    bairro?: string;
    cidadeUF?: string;
    cep?: string;
  };
  status: string;
  codigo_rastreio?: string;
}

interface MeusPedidosModalProps {
  modalPedidosAberto: boolean;
  setModalPedidosAberto: (aberto: boolean) => void;
  carregandoPedidos: boolean;
  meusPedidos: Pedido[];
  getBadgeStatus: (status: string) => string;
  retomarPagamentoPedido: (pedido: Pedido) => void;
  apagarMeuPedido: (id: string) => void;
}

export function MeusPedidosModal({
  modalPedidosAberto,
  setModalPedidosAberto,
  carregandoPedidos,
  meusPedidos,
  getBadgeStatus,
  retomarPagamentoPedido,
  apagarMeuPedido
}: MeusPedidosModalProps) {
  if (!modalPedidosAberto) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl relative flex flex-col max-h-[90vh]">
        
        {/* Cabeçalho */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4 shrink-0">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <span>📦</span> Meus Pedidos
          </h2>
          <button
            onClick={() => setModalPedidosAberto(false)}
            className="text-gray-400 hover:text-gray-600 text-xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 cursor-pointer"
          >
            &times;
          </button>
        </div>

        {/* Corpo */}
        <div className="flex-1 overflow-y-auto flex flex-col gap-4 pr-1">
          {carregandoPedidos ? (
            <p className="text-xs text-gray-400 text-center py-8">A carregar os seus pedidos...</p>
          ) : meusPedidos.length === 0 ? (
            <div className="text-center py-10 flex flex-col items-center gap-2">
              <span className="text-3xl">📭</span>
              <p className="text-xs text-gray-400 font-medium">Ainda não tem nenhum pedido registado.</p>
            </div>
          ) : (
            meusPedidos.map((ped) => {
              const end = ped.endereco_completo;
              const aguardandoPix = ped.status === 'Aguardando Pix' || ped.status === 'Pendente';

              return (
                <div key={ped.id} className="p-4 rounded-2xl border border-gray-200 bg-gray-50/50 flex flex-col gap-3 text-xs">
                  
                  {/* ID e Status */}
                  <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                    <div>
                      <span className="font-bold text-gray-900 block">Pedido #{ped.id.substring(0, 8)}</span>
                      <span className="text-[10px] text-gray-400">{new Date(ped.created_at).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${getBadgeStatus(ped.status)}`}>
                      {ped.status}
                    </span>
                  </div>

                  {/* Itens */}
                  <div className="flex flex-col gap-2">
                    <span className="font-semibold text-gray-700">Obras:</span>
                    {ped.itens && ped.itens.map((item: Arte, idx: number) => (
                      <div key={idx} className="flex items-center gap-2">
                        <img src={item.src} alt={item.alt} className="w-10 h-10 object-cover rounded-lg" />
                        <span className="font-semibold text-gray-800 flex-1 truncate">{item.alt}</span>
                        <span className="text-emerald-600 font-bold">
                          {typeof item.preco === 'number' ? `R$ ${item.preco.toFixed(2)}` : item.preco}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Endereço de Entrega */}
                  {end && (end.logradouro || end.bairro) && (
                    <div className="bg-white p-2.5 rounded-xl border border-gray-200 flex flex-col gap-0.5 text-[11px] text-gray-600">
                      <span className="font-bold text-violet-900">📍 Endereço de Entrega:</span>
                      <span>{end.logradouro}, Nº {end.numero} {end.complemento ? `(${end.complemento})` : ''}</span>
                      <span>Bairro: {end.bairro} - {end.cidadeUF} (CEP: {end.cep || ped.cep_entrega})</span>
                    </div>
                  )}

                  {/* Informações de Frete e Rastreio */}
                  <div className="flex flex-col gap-1 bg-white p-2.5 rounded-xl border border-gray-200 text-gray-600">
                    <div className="flex justify-between">
                      <span>Envio: <b>{ped.tipo_frete || 'Correios'}</b></span>
                      <span>Total Geral: <b className="text-emerald-600">R$ {ped.valor_total.toFixed(2)}</b></span>
                    </div>
                    {ped.codigo_rastreio && (
                      <div className="pt-1 border-t border-gray-100 text-violet-700 font-semibold">
                        📦 Código de Rastreio: {ped.codigo_rastreio}
                      </div>
                    )}
                  </div>

                  {/* Botões de Ação */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-200/60">
                    <button
                      onClick={() => apagarMeuPedido(ped.id)}
                      className="text-rose-500 hover:text-rose-700 text-xs font-semibold cursor-pointer"
                    >
                      🗑️ Cancelar/Apagar
                    </button>

                    {aguardandoPix && (
                      <button
                        onClick={() => retomarPagamentoPedido(ped)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 px-4 rounded-xl transition cursor-pointer shadow-sm"
                      >
                        💳 Pagar com Pix
                      </button>
                    )}
                  </div>

                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
}