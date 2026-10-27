import type { Arte } from '../types';

export interface PedidoAdmin {
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

interface AdminPedidosModalProps {
  modalAdminPedidosAberto: boolean;
  setModalAdminPedidosAberto: (aberto: boolean) => void;
  carregandoPedidos: boolean;
  todosPedidos: PedidoAdmin[];
  isAdmin: boolean;
  getBadgeStatus: (status: string) => string;
  editandoPedidoId: string | null;
  setEditandoPedidoId: (id: string | null) => void;
  novoStatus: string;
  setNovoStatus: (status: string) => void;
  novoRastreio: string;
  setNovoRastreio: (rastreio: string) => void;
  salvarAlteracaoPedidoAdmin: (id: string) => void;
}

export function AdminPedidosModal({
  modalAdminPedidosAberto,
  setModalAdminPedidosAberto,
  carregandoPedidos,
  todosPedidos,
  isAdmin,
  getBadgeStatus,
  editandoPedidoId,
  setEditandoPedidoId,
  novoStatus,
  setNovoStatus,
  novoRastreio,
  setNovoRastreio,
  salvarAlteracaoPedidoAdmin
}: AdminPedidosModalProps) {
  if (!modalAdminPedidosAberto || !isAdmin) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-6 max-w-2xl w-full shadow-2xl relative flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4 shrink-0">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <span>⚙️</span> Gestão de Pedidos (Administrador)
          </h2>
          <button
            onClick={() => setModalAdminPedidosAberto(false)}
            className="text-gray-400 hover:text-gray-600 text-xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 cursor-pointer"
          >
            &times;
          </button>
        </div>

        <div className="flex-1 overflow-y-auto flex flex-col gap-4 pr-1">
          {carregandoPedidos ? (
            <p className="text-xs text-gray-400 text-center py-8">Carregando pedidos...</p>
          ) : todosPedidos.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-8">Nenhum pedido no sistema.</p>
          ) : (
            todosPedidos.map((ped) => {
              const end = ped.endereco_completo;

              return (
                <div key={ped.id} className="p-4 rounded-2xl border border-gray-200 bg-gray-50/50 flex flex-col gap-3 text-xs">
                  <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                    <div>
                      <span className="font-bold text-gray-900 block">ID: {ped.id.substring(0, 8)}...</span>
                      <span className="text-[10px] text-gray-400">{new Date(ped.created_at).toLocaleString('pt-BR')}</span>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${getBadgeStatus(ped.status)}`}>
                      {ped.status}
                    </span>
                  </div>

                  {/* Obras do Pedido */}
                  <div className="flex flex-col gap-1.5">
                    <span className="font-semibold text-gray-700">Obras Compradas:</span>
                    {ped.itens && ped.itens.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <img src={item.src} alt={item.alt} className="w-8 h-8 object-cover rounded" />
                        <span className="text-gray-800 flex-1 truncate">{item.alt}</span>
                      </div>
                    ))}
                  </div>

                  {/* Detalhes de Endereço Completo */}
                  <div className="bg-white p-3 rounded-xl border border-gray-200 flex flex-col gap-1.5 text-gray-700">
                    <span className="font-bold text-violet-900 flex items-center gap-1">
                      <span>🏠</span> Endereço Completo do Cliente:
                    </span>
                    {end && (end.logradouro || end.bairro) ? (
                      <div className="flex flex-col gap-0.5 text-[11px] leading-relaxed">
                        <span><b>Rua/Logradouro:</b> {end.logradouro || 'N/A'}, Nº {end.numero || 'S/N'} {end.complemento ? `(${end.complemento})` : ''}</span>
                        <span><b>Bairro:</b> {end.bairro || 'N/A'}</span>
                        <span><b>Cidade/UF:</b> {end.cidadeUF || 'N/A'}</span>
                        <span><b>CEP:</b> {end.cep || ped.cep_entrega || 'N/A'}</span>
                      </div>
                    ) : (
                      <span className="text-[11px] text-gray-500 italic">
                        CEP Cadastrado: <b>{ped.cep_entrega || 'Não informado'}</b> (Endereço detalhado não preenchido)
                      </span>
                    )}
                  </div>

                  <div className="flex justify-between items-center text-gray-600 bg-white p-2.5 rounded-xl border border-gray-200">
                    <span>Envio: <b>{ped.tipo_frete || 'PAC'}</b></span>
                    <span>Total: <b className="text-emerald-600">R$ {ped.valor_total.toFixed(2)}</b></span>
                  </div>

                  {editandoPedidoId === ped.id ? (
                    <div className="bg-violet-50 p-3 rounded-xl border border-violet-200 flex flex-col gap-2 mt-2">
                      <span className="font-bold text-violet-900">Atualizar Status / Rastreio:</span>
                      <div className="flex gap-2">
                        <select
                          value={novoStatus}
                          onChange={(e) => setNovoStatus(e.target.value)}
                          className="text-xs p-2 rounded-lg border border-gray-300 bg-white flex-1"
                        >
                          <option value="Aguardando Pix">Aguardando Pix</option>
                          <option value="Aprovado">Aprovado</option>
                          <option value="Enviado">Enviado</option>
                          <option value="Concluído">Concluído</option>
                          <option value="Cancelado">Cancelado</option>
                        </select>
                        <input
                          type="text"
                          placeholder="Código Rastreio (ex: NL123456789BR)"
                          value={novoRastreio}
                          onChange={(e) => setNovoRastreio(e.target.value)}
                          className="text-xs p-2 rounded-lg border border-gray-300 bg-white flex-1"
                        />
                      </div>
                      <div className="flex gap-2 justify-end pt-1">
                        <button
                          onClick={() => setEditandoPedidoId(null)}
                          className="px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-200 rounded-lg cursor-pointer"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={() => salvarAlteracaoPedidoAdmin(ped.id)}
                          className="px-4 py-1.5 text-xs font-bold bg-violet-600 hover:bg-violet-700 text-white rounded-lg cursor-pointer"
                        >
                          Salvar Alterações
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center pt-2 border-t border-gray-200/60">
                      <span className="text-[11px] text-gray-500">Rastreio: <b>{ped.codigo_rastreio || 'Sem código'}</b></span>
                      <button
                        onClick={() => {
                          setEditandoPedidoId(ped.id);
                          setNovoStatus(ped.status);
                          setNovoRastreio(ped.codigo_rastreio || '');
                        }}
                        className="bg-gray-800 hover:bg-black text-white text-xs font-bold px-3 py-1.5 rounded-xl transition cursor-pointer"
                      >
                        ✏️ Alterar Status / Rastreio
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}