import { useState, useEffect } from 'react';
import Giovanni from "../assets/img/foto.jpg";
import { supabase } from '../supabaseClient';

interface SidebarProps {
    isAdmin: boolean;
    toggleAdmin: () => void;
}

export function Sidebar({ isAdmin, toggleAdmin }: SidebarProps) {
    const [emailInscricao, setEmailInscricao] = useState('');
    const [carregandoEmail, setCarregandoEmail] = useState(false);
    const [mensagemInscricao, setMensagemInscricao] = useState('');
    const [modoRemoverEmail, setModoRemoverEmail] = useState(false);
    const [pushAtivo, setPushAtivo] = useState(false);
    const [totalSeguidores, setTotalSeguidores] = useState<number | null>(null);

    // 🌟 Base fixa de inscritos via Web Push
    const BASE_WEB_PUSH = 5;

    // Função centralizada para buscar a contagem do Supabase + Base + Status atual do Push
    const recarregarContagem = async () => {
        try {
            const { count, error } = await supabase
                .from('newsletter_inscritos')
                .select('*', { count: 'exact', head: true });

            const totalSupabase = (!error && count !== null) ? count : 0;

            // Verifica se o navegador atual está com o Push ativo no OneSignal
            let pushExtra = 0;
            // @ts-ignore
            if (window.OneSignal) {
                // @ts-ignore
                const isOptedIn = await window.OneSignal.User.PushSubscription.optedIn;
                setPushAtivo(!!isOptedIn);
                if (isOptedIn) {
                    pushExtra = 1; // Soma 1 se este navegador estiver inscrito no push
                }
            }

            // Soma total: Supabase + Base Fixa + Push deste navegador (se ativo)
            setTotalSeguidores(totalSupabase + BASE_WEB_PUSH + pushExtra);
        } catch (err) {
            console.error('Erro ao buscar contagem de inscritos:', err);
        }
    };

    // Busca dados iniciais ao carregar a página
    useEffect(() => {
        const inicializar = async () => {
            // Pequeno delay para garantir que o SDK do OneSignal injetou na página
            setTimeout(async () => {
                await recarregarContagem();
            }, 500);
        };

        inicializar();
    }, []);

    // Manipula inscrição e cancelamento de e-mail no Supabase
    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!emailInscricao.trim()) return;

        setCarregandoEmail(true);
        setMensagemInscricao('');

        try {
            if (modoRemoverEmail) {
                const { error, count } = await supabase
                    .from('newsletter_inscritos')
                    .delete({ count: 'exact' })
                    .eq('email', emailInscricao.trim());

                if (error) {
                    setMensagemInscricao('❌ Erro ao cancelar inscrição.');
                } else if (count === 0) {
                    setMensagemInscricao('⚠️ Este e-mail não foi encontrado.');
                } else {
                    setMensagemInscricao('✅ Inscrição cancelada com sucesso.');
                    setEmailInscricao('');
                    setModoRemoverEmail(false);
                    await recarregarContagem();
                }
            } else {
                const { error } = await supabase
                    .from('newsletter_inscritos')
                    .insert([{ email: emailInscricao.trim() }]);

                if (error) {
                    if (error.code === '23505') {
                        setMensagemInscricao('✨ Este e-mail já está cadastrado!');
                    } else {
                        setMensagemInscricao('❌ Erro ao se inscrever. Tente novamente.');
                    }
                } else {
                    setMensagemInscricao('🎉 Inscrição realizada com sucesso!');
                    setEmailInscricao('');
                    await recarregarContagem();
                }
            }
        } catch (err) {
            console.error(err);
            setMensagemInscricao('❌ Erro de conexão.');
        } finally {
            setCarregandoEmail(false);
        }
    };

    // Alterna as notificações Push do Navegador (OneSignal v16)
    const toggleNotificacoesBrowser = async () => {
        // @ts-ignore
        if (window.OneSignal) {
            try {
                // @ts-ignore
                const isOptedIn = window.OneSignal.User.PushSubscription.optedIn;

                if (isOptedIn) {
                    // Desativar Notificações
                    // @ts-ignore
                    await window.OneSignal.User.PushSubscription.optOut();
                    setPushAtivo(false);
                    alert('🔔 Notificações do navegador desativadas.');
                } else {
                    // Ativar Notificações
                    // @ts-ignore
                    await window.OneSignal.Notifications.requestPermission();
                    // @ts-ignore
                    await window.OneSignal.User.PushSubscription.optIn();
                    setPushAtivo(true);
                }
                
                // Recarrega o contador com base no novo estado do push
                await recarregarContagem();
            } catch (err) {
                console.error('Erro no OneSignal:', err);
            }
        } else {
            alert('O sistema de notificações ainda está carregando.');
        }
    };
    
    return (
        <aside className="w-full lg:w-80 bg-[#f4f2ec] p-6 flex flex-col text-gray-800 shadow-lg lg:fixed lg:right-0 lg:top-20 lg:h-[calc(100vh-5rem)] lg:overflow-y-auto border-l border-gray-200/60">
            <div className="flex items-center gap-3 mb-4">
                <img className="rounded-full w-16 h-16 object-cover shadow-sm ring-2 ring-violet-200" src={Giovanni} alt="Giovanni" />
                <div>
                    <p className="text-xs text-gray-500">Olá! Eu sou</p>
                    <h2 className="font-bold text-sm sm:text-base text-gray-900">Giovanni Vittorazze</h2>
                </div>
            </div>

            <div className="text-xs sm:text-sm text-gray-600 leading-relaxed flex flex-col gap-3">
                <p>Eu sou um aprendiz da arte, amo a arte realista mas estou sempre buscando aprender novas técnicas para expandir minha criatividade.</p>
                <p>Na pintura, eu faço mandalas de caráter religioso, pois é o que mais combina com o tema!</p>
            </div>

            {/* BLOCO DE SEGUIDORES E NOTIFICAÇÕES (COMPACTO COM CONTADOR) */}
            <div className="mt-4 p-3.5 bg-white rounded-2xl shadow-xs border border-violet-100 flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-violet-900 uppercase tracking-wider flex items-center gap-1.5">
                        <span>🔔</span> Siga o Atelier
                    </span>
                    <button
                        type="button"
                        onClick={() => {
                            setModoRemoverEmail(!modoRemoverEmail);
                            setMensagemInscricao('');
                        }}
                        className="text-[10px] text-violet-600 hover:underline"
                    >
                        {modoRemoverEmail ? 'Voltar' : 'Cancelar e-mail?'}
                    </button>
                </div>

                {/* CONTADOR / PROVA SOCIAL */}
                {totalSeguidores !== null && (
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-violet-50/70 border border-violet-100 rounded-lg w-fit">
                        <span className="text-[11px]">👥</span>
                        <span className="text-[11px] font-semibold text-violet-900">
                            {totalSeguidores} {totalSeguidores === 1 ? 'seguidor' : 'seguidores'}
                        </span>
                    </div>
                )}

                <p className="text-[11px] text-gray-500 leading-tight">
                    {modoRemoverEmail
                        ? 'Digite seu e-mail para remover da lista.'
                        : 'Receba avisos de novas obras em primeira mão!'}
                </p>

                {/* Formulário de E-mail */}
                <form onSubmit={handleEmailSubmit} className="flex flex-col gap-1.5">
                    <input
                        type="email"
                        placeholder="Seu melhor e-mail"
                        value={emailInscricao}
                        onChange={(e) => setEmailInscricao(e.target.value)}
                        className="text-xs p-2 rounded-xl border border-gray-300 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-violet-500"
                        required
                    />
                    <button
                        type="submit"
                        disabled={carregandoEmail}
                        className={`text-xs font-bold py-2 rounded-xl transition cursor-pointer shadow-sm disabled:opacity-50 text-white ${modoRemoverEmail
                            ? 'bg-rose-600 hover:bg-rose-700'
                            : 'bg-violet-600 hover:bg-violet-700'
                            }`}
                    >
                        {carregandoEmail
                            ? 'Processando...'
                            : modoRemoverEmail
                                ? '🚫 Confirmar Remoção'
                                : '📧 Receber por E-mail'}
                    </button>
                </form>

                {mensagemInscricao && (
                    <p className="text-[10px] font-medium text-center text-violet-700">{mensagemInscricao}</p>
                )}

                {/* Botão de Notificações do Navegador / Celular */}
                <button
                    type="button"
                    onClick={toggleNotificacoesBrowser}
                    className={`flex items-center justify-center gap-1.5 py-1.5 px-3 text-[11px] font-semibold rounded-xl transition cursor-pointer border ${pushAtivo
                        ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                        : 'bg-violet-50 text-violet-800 border-violet-200/60 hover:bg-violet-100'
                        }`}
                >
                    <span>📱</span> {pushAtivo ? 'Desativar Push' : 'Ativar Push no Celular/PC'}
                </button>
            </div>

            <div className="mt-6 lg:mt-auto pt-4 border-t border-gray-300/80 text-center flex flex-col gap-3">
                <div>
                    <span className="font-bold block text-gray-800 text-xs uppercase tracking-wider mb-0.5">Localização:</span>
                    <div className="text-xs font-medium text-gray-600">📍 Uberaba / MG</div>
                </div>
                <div className="pt-2 border-t border-gray-300/60">
                    <span className="font-bold block text-gray-800 text-xs uppercase tracking-wider mb-1">WhatsApp / Contato:</span>
                    <a href="https://wa.me/5534998641993" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50/80 hover:bg-emerald-100 py-2 px-4 rounded-xl transition shadow-sm">
                        <span>💬</span> (34) 99864-1993
                    </a>
                </div>

                <div className="pt-3 flex flex-col gap-2">
                    <button onClick={toggleAdmin} className="text-[10px] text-gray-400 hover:text-gray-600 underline cursor-pointer">
                        {isAdmin ? '🔓 Desativar Modo Admin' : '🔒 Áreas do Artista'}
                    </button>

                    <div className="text-[10px] text-gray-400 pt-2 border-t border-gray-300/60 leading-tight">
                        &copy; {new Date().getFullYear()} Giovanni Vittorazze. <br />
                        Obras únicas e autorais. Todos os direitos reservados.
                    </div>
                </div>
            </div>
        </aside>
    );
}