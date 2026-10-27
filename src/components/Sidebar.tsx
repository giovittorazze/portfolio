import { useState, useEffect } from 'react';
import Giovanni from "../assets/img/foto.jpg";
import { supabase } from '../supabaseClient';

interface SidebarProps {
    isAdmin: boolean;
    toggleAdmin: () => void;
}

export function Sidebar({
    isAdmin,
    toggleAdmin
}: SidebarProps) {
    const [pushAtivo, setPushAtivo] = useState(false);
    const [totalSeguidores, setTotalSeguidores] = useState<number | null>(null);

    const BASE_WEB_PUSH = 0;

    const recarregarContagem = async () => {
        try {
            const { count: countEmails } = await supabase
                .from('newsletter_inscritos')
                .select('*', { count: 'exact', head: true });

            const { count: countPush } = await supabase
                .from('push_inscritos')
                .select('*', { count: 'exact', head: true });

            const totalEmails = countEmails !== null ? countEmails : 0;
            const totalPushBD = countPush !== null ? countPush : 0;

            setTotalSeguidores(totalEmails + totalPushBD + BASE_WEB_PUSH);
        } catch (err) {
            console.error('Erro ao buscar contagem global:', err);
        }
    };

    useEffect(() => {
        const inicializar = async () => {
            setTimeout(async () => {
                // @ts-ignore
                if (window.OneSignal && window.OneSignal.User) {
                    // @ts-ignore
                    const isOptedIn = window.OneSignal.User.PushSubscription.optedIn;
                    setPushAtivo(!!isOptedIn);
                }
                await recarregarContagem();
            }, 600);
        };

        inicializar();
    }, []);

    const toggleNotificacoesBrowser = async () => {
        // @ts-ignore
        if (typeof window.OneSignal !== 'undefined' && window.OneSignal.User) {
            try {
                // @ts-ignore
                const OneSignal = window.OneSignal;
                // @ts-ignore
                const isOptedIn = OneSignal.User.PushSubscription.optedIn;

                if (isOptedIn || pushAtivo) {
                    // 🔕 DESATIVAR NOTIFICAÇÕES (OPT-OUT)
                    // @ts-ignore
                    const subscriptionId = OneSignal.User.PushSubscription.id;
                    // @ts-ignore
                    await OneSignal.User.PushSubscription.optOut();
                    setPushAtivo(false);

                    if (subscriptionId) {
                        await supabase
                            .from('push_inscritos')
                            .delete()
                            .eq('subscription_id', subscriptionId);
                    }

                    alert('🔔 Notificações do navegador desativadas.');
                } else {
                    // 🔔 ATIVAR NOTIFICAÇÕES (OPT-IN)
                    if (OneSignal.Notifications) {
                        await OneSignal.Notifications.requestPermission();
                    }
                    // @ts-ignore
                    await OneSignal.User.PushSubscription.optIn();

                    let subscriptionId = null;
                    for (let i = 0; i < 5; i++) {
                        // @ts-ignore
                        subscriptionId = OneSignal.User.PushSubscription.id;
                        if (subscriptionId) break;
                        await new Promise((res) => setTimeout(res, 500));
                    }

                    if (subscriptionId) {
                        await supabase
                            .from('push_inscritos')
                            .upsert([{ subscription_id: subscriptionId }], { onConflict: 'subscription_id' });
                    }
                    setPushAtivo(true);
                    alert('🎉 Notificações ativadas com sucesso!');
                }

                await recarregarContagem();
            } catch (err: any) {
                console.error('Erro detalhado no OneSignal:', err);
                alert('Erro ao alterar as notificações: ' + (err.message || err));
            }
        } else {
            // 🍏 Deteta se é iPhone / iPad / iPod
            const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

            if (isIOS) {
                alert(
                    '📱 Como ativar as Notificações no iPhone:\n\n' +
                    '1. Certifique-se de que está a abrir o site no navegador Safari.\n' +
                    '2. Toque no botão de "Partilhar" (quadrado com seta para cima) na barra inferior.\n' +
                    '3. Escolha a opção "Adicionar à Tela de Início".\n' +
                    '4. Feche o Safari, abra o site pelo novo ícone que apareceu no seu ecrã inicial e clique novamente em ativar notificações!'
                );
            } else {
                alert('⚠️ O serviço de notificações Push (OneSignal) não está ativo neste momento (normal em ambiente local/localhost). Em produção na Vercel funcionará normalmente.');
            }
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
                <p>Eu sou um aprendiz da arte, amo o realismo mas estou sempre buscando aprender novas técnicas para expandir minha criatividade.</p>
                <p>Este é o meu espaço para compartilhar minhas obras, bastidores e novidades. Sinta-se à vontade para explorar e acompanhar meu trabalho!</p>
            </div>

            {/* CARD ÚNICO: COMUNIDADE + BOTÃO DE NOTIFICAÇÕES */}
            <div className="mt-4 p-3.5 bg-violet-50/90 rounded-2xl border border-violet-100 flex flex-col gap-3 shadow-xs text-center">
                <div>
                    <span className="text-xs font-bold text-violet-900 block">👥 Comunidade de Seguidores</span>
                    <span className="text-sm font-extrabold text-violet-700">
                        {totalSeguidores !== null ? `${totalSeguidores} pessoas acompanhando` : 'A carregar...'}
                    </span>
                </div>

                <button
                    type="button"
                    onClick={toggleNotificacoesBrowser}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm cursor-pointer ${
                        pushAtivo 
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-200' 
                            : 'bg-violet-600 text-white hover:bg-violet-700'
                    }`}
                >
                    <span>{pushAtivo ? '🔔 Notificações Ativadas' : '🔔 Ativar Notificações Push'}</span>
                </button>
            </div>

            <br />

            <a
                href="https://www.instagram.com/giovannivittorazze/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-rose-700 hover:text-rose-800 bg-rose-50/80 hover:bg-rose-100 py-2 px-4 rounded-xl transition shadow-sm"
            >
                <svg className="w-4 h-4 fill-current text-rose-600" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
                <span>Siga no Instagram</span>
            </a>

            {isAdmin && (
                <div className="mt-4 p-3 bg-violet-50 rounded-2xl border border-violet-200 text-xs text-violet-900">
                    <p className="font-bold mb-1">⚙️ Modo Admin Ativo</p>
                    <p className="text-[11px] text-violet-700">
                        Para disparar e-mails para a lista, exporte a tabela <code className="bg-violet-100 px-1 rounded">newsletter_inscritos</code> do Supabase em formato CSV.
                    </p>
                </div>
            )}

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

                <div className="pt-3 flex flex-col gap-2 border-t border-gray-300/65">
                    <button onClick={toggleAdmin} className="text-[10px] text-gray-400 hover:text-gray-600 underline cursor-pointer">
                        {isAdmin ? '🔓 Desativar Modo Admin' : '🔒 Áreas do Artista'}
                    </button>

                    <div className="text-[10px] text-gray-400 pt-1 leading-tight">
                        &copy; {new Date().getFullYear()} Giovanni Vittorazze. <br />
                        Obras únicas e autorais. Todos os direitos reservados.
                    </div>
                </div>
            </div>
        </aside>
    );
// 