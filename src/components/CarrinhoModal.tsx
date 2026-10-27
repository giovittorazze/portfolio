import { Payment } from '@mercadopago/sdk-react';
import type { Arte } from '../types';

interface OpcaoFrete {
    id: string;
    nome: string;
    valor: number;
    prazo: string;
}

export interface EnderecoCliente {
    logradouro: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidadeUF: string;
    cep: string;
}

interface CarrinhoModalProps {
    carrinhoAberto: boolean;
    setCarrinhoAberto: (aberto: boolean) => void;
    carrinho: Arte[];
    removerDoCarrinho: (id: string) => void;
    etapaPagamento: boolean;
    setEtapaPagamento: (etapa: boolean) => void;
    dadosPix: any;
    setDadosPix: (dados: any) => void;
    cep: string;
    setCep: (cep: string) => void;
    endereco: EnderecoCliente;
    setEndereco: React.Dispatch<React.SetStateAction<EnderecoCliente>>;
    calculandoFrete: boolean;
    calcularFreteCorreios: () => void;
    infoCidade: string;
    opcoesFrete: OpcaoFrete[];
    freteSelecionado: OpcaoFrete | null;
    setFreteSelecionado: (opcao: OpcaoFrete) => void;
    subtotalCarrinho: number;
    valorFrete: number;
    valorTotalGeral: number;
    usuario: any;
    setModoModal: (modo: 'login' | 'cadastro') => void;
    setModalAuthAberto: (aberto: boolean) => void;
    initialization: any;
    customization: any;
    onSubmitMercadoPago: (data: any) => Promise<any> | any;
    carregarDadosDoBanco: () => void;
}

export function CarrinhoModal({
    carrinhoAberto,
    setCarrinhoAberto,
    carrinho,
    removerDoCarrinho,
    etapaPagamento,
    setEtapaPagamento,
    dadosPix,
    setDadosPix,
    cep,
    setCep,
    endereco,
    setEndereco,
    calculandoFrete,
    calcularFreteCorreios,
    infoCidade,
    opcoesFrete,
    freteSelecionado,
    setFreteSelecionado,
    subtotalCarrinho,
    valorFrete,
    valorTotalGeral,
    usuario,
    setModoModal,
    setModalAuthAberto,
    initialization,
    customization,
    onSubmitMercadoPago,
    carregarDadosDoBanco
}: CarrinhoModalProps) {
    if (!carrinhoAberto) return null;

    const validarEndereco = () => {
        if (!endereco.logradouro.trim() || !endereco.numero.trim() || !endereco.bairro.trim() || !cep) {
            alert('Por favor, preencha todos os campos obrigatórios do endereço (Rua, Número, Bairro e CEP).');
            return false;
        }
        return true;
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl relative flex flex-col max-h-[90vh]">

                {/* Cabeçalho */}
                <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4 shrink-0">
                    <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <span>🛒</span> {dadosPix ? 'Pagamento via Pix' : etapaPagamento ? 'Finalizar Pagamento' : `Sua Sacola (${carrinho.length})`}
                    </h2>
                    <button
                        onClick={() => { setCarrinhoAberto(false); setEtapaPagamento(false); setDadosPix(null); }}
                        className="text-gray-400 hover:text-gray-600 text-xl font-bold w-8 h-8 flex items-center justify-center cursor-pointer rounded-full hover:bg-gray-100"
                    >
                        &times;
                    </button>
                </div>

                {/* Corpo */}
                <div className="flex-1 overflow-y-auto flex flex-col gap-3 pr-1">
                    {dadosPix ? (
                        <div className="flex flex-col items-center gap-4 py-2">
                            <div className="bg-emerald-50 text-emerald-700 p-3 rounded-2xl border border-emerald-100 w-full text-center text-xs font-semibold">
                                ✅ Pedido registrado! Conclua o pagamento via Pix abaixo.
                            </div>

                            {dadosPix.qr_code_base64 && (
                                <div className="flex flex-col items-center gap-1">
                                    <span className="text-xs font-bold text-gray-700">Escaneie o QR Code:</span>
                                    <img
                                        src={`data:image/jpeg;base64,${dadosPix.qr_code_base64}`}
                                        alt="QR Code Pix"
                                        className="w-48 h-48 object-contain bg-white p-2 rounded-2xl border border-gray-200 shadow-sm"
                                    />
                                </div>
                            )}

                            {dadosPix.qr_code && (
                                <div className="w-full flex flex-col gap-2">
                                    <span className="text-xs font-bold text-gray-700">Pix Copia e Cola:</span>
                                    <textarea
                                        readOnly
                                        value={dadosPix.qr_code}
                                        className="w-full text-[11px] p-3 rounded-2xl border border-gray-200 bg-gray-50 text-gray-700 font-mono resize-none h-20 focus:outline-none select-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            navigator.clipboard.writeText(dadosPix.qr_code || '');
                                            alert('Código Pix copiado! 📋');
                                        }}
                                        className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs py-3 rounded-2xl transition cursor-pointer shadow-sm flex items-center justify-center gap-2"
                                    >
                                        <span>📋</span> Copiar Código Pix
                                    </button>
                                </div>
                            )}

                            <button
                                type="button"
                                onClick={() => {
                                    setDadosPix(null);
                                    setEtapaPagamento(false);
                                    setCarrinhoAberto(false);
                                    carregarDadosDoBanco();
                                }}
                                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs py-2.5 rounded-2xl transition cursor-pointer mt-2"
                            >
                                Fechar / Concluído
                            </button>
                        </div>
                    ) : etapaPagamento ? (
                        <div className="flex flex-col gap-4">
                            <button
                                onClick={() => setEtapaPagamento(false)}
                                className="self-start text-xs text-violet-600 font-semibold cursor-pointer hover:underline flex items-center gap-1"
                            >
                                &larr; Voltar à sacola
                            </button>

                            <div className="bg-violet-50/60 p-3 rounded-2xl border border-violet-100 text-xs flex flex-col gap-1">
                                <span className="font-bold text-violet-900">📍 Endereço de Entrega:</span>
                                <span className="text-gray-700">{endereco.logradouro}, Nº {endereco.numero} {endereco.complemento ? `(${endereco.complemento})` : ''}</span>
                                <span className="text-gray-700">Bairro: {endereco.bairro} - {endereco.cidadeUF || infoCidade}</span>
                                <span className="text-gray-700">CEP: {cep}</span>
                                <span className="text-gray-600 mt-1">Frete: <b>{freteSelecionado?.nome}</b> (R$ {valorFrete.toFixed(2)})</span>
                            </div>

                            {/* Envolva em uma div com altura mínima para estabilizar o SVG do Pix/Cartão */}
                            <div className="min-h-[450px] w-full">
                                {valorTotalGeral > 0 && (
                                    <Payment
                                        initialization={initialization}
                                        customization={customization}
                                        onSubmit={onSubmitMercadoPago}
                                    />
                                )}
                            </div>
                        </div>
                    ) : (
                        <>
                            {carrinho.length === 0 ? (
                                <div className="py-10 text-center flex flex-col items-center gap-2">
                                    <span className="text-4xl">🛍️</span>
                                    <p className="text-xs text-gray-400 font-medium">A sua sacola está vazia.</p>
                                </div>
                            ) : (
                                carrinho.map((item) => (
                                    <div key={item.id} className="flex items-center gap-3 p-2.5 rounded-2xl border border-gray-100 bg-gray-50/50">
                                        <img src={item.src} alt={item.alt} className="w-14 h-14 object-cover rounded-xl shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <span className="text-xs font-bold text-gray-800 truncate block">{item.alt}</span>
                                            <span className="text-xs font-extrabold text-emerald-600 block mt-0.5">
                                                {typeof item.preco === 'number' ? `R$ ${item.preco.toFixed(2)}` : item.preco}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => removerDoCarrinho(item.id)}
                                            className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition cursor-pointer text-xs"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                ))
                            )}
                        </>
                    )}
                </div>

                {/* Rodapé e Frete/Endereço */}
                {!etapaPagamento && !dadosPix && carrinho.length > 0 && (
                    <div className="pt-3 border-t border-gray-100 mt-3 flex flex-col gap-3 shrink-0">
                        <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100 flex flex-col gap-2">
                            <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                                <span>📍</span> Endereço e Frete
                            </span>

                            {/* CEP + Botão Responsivo */}
                            <div className="flex flex-col sm:flex-row gap-2">
                                <input
                                    type="text"
                                    placeholder="CEP (00000-000)"
                                    value={cep}
                                    onChange={(e) => setCep(e.target.value.replace(/\D/g, ''))}
                                    maxLength={8}
                                    className="text-xs p-2.5 rounded-xl border border-gray-200 bg-white flex-1 focus:outline-none w-full"
                                />
                                <button
                                    type="button"
                                    onClick={calcularFreteCorreios}
                                    disabled={calculandoFrete}
                                    className="bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition cursor-pointer whitespace-nowrap"
                                >
                                    {calculandoFrete ? '...' : 'Buscar CEP'}
                                </button>
                            </div>

                            {infoCidade && <span className="text-[11px] text-emerald-600 font-semibold">📍 {infoCidade}</span>}

                            {/* Campos de Endereço Completo Responsivos */}
                            <div className="flex flex-col gap-2 pt-2 border-t border-gray-200/60">
                                <input
                                    type="text"
                                    placeholder="Rua / Avenida *"
                                    value={endereco.logradouro}
                                    onChange={(e) => setEndereco({ ...endereco, logradouro: e.target.value })}
                                    className="text-xs p-2.5 rounded-lg border border-gray-200 bg-white w-full"
                                />

                                <div className="flex flex-col sm:flex-row gap-2">
                                    <input
                                        type="text"
                                        placeholder="Número *"
                                        value={endereco.numero}
                                        onChange={(e) => setEndereco({ ...endereco, numero: e.target.value })}
                                        className="text-xs p-2.5 rounded-lg border border-gray-200 bg-white w-full sm:w-28"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Complemento (Ap, Bloco)"
                                        value={endereco.complemento || ''}
                                        onChange={(e) => setEndereco({ ...endereco, complemento: e.target.value })}
                                        className="text-xs p-2.5 rounded-lg border border-gray-200 bg-white flex-1 w-full"
                                    />
                                </div>

                                <input
                                    type="text"
                                    placeholder="Bairro *"
                                    value={endereco.bairro}
                                    onChange={(e) => setEndereco({ ...endereco, bairro: e.target.value })}
                                    className="text-xs p-2.5 rounded-lg border border-gray-200 bg-white w-full"
                                />
                            </div>

                            {opcoesFrete.length > 0 && (
                                <div className="flex flex-col gap-1.5 pt-2 border-t border-gray-200/60">
                                    {opcoesFrete.map((opcao) => (
                                        <label
                                            key={opcao.id}
                                            className={`flex items-center justify-between p-2 rounded-xl border text-xs cursor-pointer transition ${freteSelecionado?.id === opcao.id ? 'border-violet-600 bg-violet-50 font-semibold' : 'border-gray-200 bg-white'
                                                }`}
                                        >
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="radio"
                                                    name="frete"
                                                    checked={freteSelecionado?.id === opcao.id}
                                                    onChange={() => setFreteSelecionado(opcao)}
                                                    className="accent-violet-600"
                                                />
                                                <span>{opcao.nome} <span className="text-[10px] text-gray-400">({opcao.prazo})</span></span>
                                            </div>
                                            <span className="font-bold text-gray-800">R$ {opcao.valor.toFixed(2)}</span>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col gap-1 text-xs px-1">
                            <div className="flex justify-between text-gray-500">
                                <span>Subtotal:</span>
                                <span className="font-semibold text-gray-800">R$ {subtotalCarrinho.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-gray-500">
                                <span>Frete:</span>
                                <span className="font-semibold text-gray-800">{freteSelecionado ? `R$ ${valorFrete.toFixed(2)}` : 'A calcular'}</span>
                            </div>
                            <div className="flex justify-between text-xs pt-2 border-t border-gray-100 font-bold">
                                <span className="text-gray-900">Total:</span>
                                <span className="text-emerald-600 text-sm">R$ {valorTotalGeral.toFixed(2)}</span>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => {
                                if (!usuario) {
                                    alert('Faça login para continuar.');
                                    setModoModal('cadastro');
                                    setModalAuthAberto(true);
                                    return;
                                }
                                if (!validarEndereco()) return;
                                if (!freteSelecionado) {
                                    alert('Selecione a opção de frete.');
                                    return;
                                }
                                setEtapaPagamento(true);
                            }}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 rounded-2xl transition cursor-pointer flex items-center justify-center gap-2"
                        >
                            <span>💳</span> Ir para o Pagamento (R$ {valorTotalGeral.toFixed(2)})
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}