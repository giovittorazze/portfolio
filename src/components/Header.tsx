import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import type { User } from '@supabase/supabase-js';
import { AuthModal } from './AuthModal';
import { PerfilModal } from './PerfilModal';

interface HeaderProps {
  paginaAtual: 'galeria' | 'postagens';
  setPaginaAtual: (pagina: 'galeria' | 'postagens') => void;
  menuAberto: boolean;
  setMenuAberto: (aberto: boolean) => void;
  carrinhoQtd: number;          // 👈 Quantidade de itens no carrinho
  onOpenCarrinho: () => void;   // 👈 Função para abrir o modal do carrinho
}

export function Header({
  paginaAtual,
  setPaginaAtual,
  menuAberto,
  setMenuAberto,
  carrinhoQtd,
  onOpenCarrinho
}: HeaderProps) {
  const [usuario, setUsuario] = useState<User | null>(null);
  const [modalAuthAberto, setModalAuthAberto] = useState(false);
  const [modalPerfilAberto, setModalPerfilAberto] = useState(false);
  const [modoModal, setModoModal] = useState<'login' | 'cadastro'>('login');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    async function verificarSessao() {
      const { data: { user } } = await supabase.auth.getUser();
      setUsuario(user);
      if (user) buscarAvatar(user.id);
    }

    verificarSessao();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const user = session?.user ?? null;
      setUsuario(user);
      if (user) buscarAvatar(user.id);
      else setAvatarUrl(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const buscarAvatar = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('avatar_url')
      .eq('id', userId)
      .single();
    if (data) setAvatarUrl(data.avatar_url);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUsuario(null);
    setAvatarUrl(null);
  };

  return (
    <>
      <header className="fixed top-0 left-0 w-full h-20 bg-gradient-to-r from-violet-600 via-purple-600 to-cyan-600 flex items-center justify-between px-4 sm:px-10 shadow-md z-40 text-white">
        <span
          onClick={() => {
            if (paginaAtual !== 'galeria') {
              setPaginaAtual('galeria');
            }
          }}
          className={`font-['amoresa'] text-2xl sm:text-3xl tracking-wide transition ${paginaAtual !== 'galeria' ? 'cursor-pointer hover:opacity-80 active:scale-98' : 'cursor-default'
            }`}
          title={paginaAtual !== 'galeria' ? 'Voltar para la Galeria' : ''}
        >
          Giovanni Vittorazze
        </span>

        {/* DIREITA: CARRINHO + FOTO DE PERFIL + SAIR (OU LOGAR/CADASTRAR) + MENU */}
        <div className="flex items-center gap-2 sm:gap-3">

          {/* BOTÃO DO CARRINHO */}
          <button
            onClick={onOpenCarrinho}
            className="relative w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 transition cursor-pointer backdrop-blur-xs flex items-center justify-center border border-white/40 hover:border-white shadow-sm"
            title="Ver Sacola de Compras"
          >
            <span className="text-[18px]">🛒</span>

            {/* O número aparece aqui se houver itens */}
            {carrinhoQtd > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-md animate-pulse">
                {carrinhoQtd}
              </span>
            )}
          </button>
          
          {usuario ? (
            <div className="flex items-center gap-2">
              {/* FOTO DE PERFIL / BOTÃO DE PERFIL */}
              <button
                onClick={() => setModalPerfilAberto(true)}
                className="w-9 h-9 rounded-full overflow-hidden border-2 border-white/40 hover:border-white transition cursor-pointer shadow-sm bg-violet-800 flex items-center justify-center"
                title="Editar Perfil"
              >
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Perfil" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs font-bold text-white">👤</span>
                )}
              </button>

              {/* BOTÃO SAIR */}
              <button
                onClick={handleLogout}
                className="text-[11px] font-semibold bg-white/15 hover:bg-rose-500/80 hover:text-white transition px-3 py-1.5 rounded-lg backdrop-blur-xs cursor-pointer border border-white/20"
                title="Sair da conta"
              >
                Sair
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={() => {
                  setModoModal('login');
                  setModalAuthAberto(true);
                }}
                className="text-[11px] font-semibold bg-white/15 hover:bg-white/25 transition px-2.5 py-1.5 rounded-lg backdrop-blur-xs cursor-pointer border border-white/20"
              >
                Logar
              </button>
              <button
                onClick={() => {
                  setModoModal('cadastro');
                  setModalAuthAberto(true);
                }}
                className="text-[11px] font-bold bg-white text-violet-700 hover:bg-violet-50 transition px-2.5 py-1.5 rounded-lg shadow-xs cursor-pointer"
              >
                Cadastrar
              </button>
            </>
          )}

          {/* BOTÃO HAMBURGUER */}
          <div className="relative">
            <button
              onClick={() => setMenuAberto(!menuAberto)}
              className="flex flex-col justify-center items-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/15 hover:bg-white/25 transition cursor-pointer backdrop-blur-xs ml-1"
              aria-label="Menu"
            >
              <span className={`block w-5 h-0.5 bg-white transition-transform ${menuAberto ? 'rotate-45 translate-y-1.5' : ''}`}></span>
              <span className={`block w-5 h-0.5 bg-white my-1 transition-opacity ${menuAberto ? 'opacity-0' : ''}`}></span>
              <span className={`block w-5 h-0.5 bg-white transition-transform ${menuAberto ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
            </button>

            {menuAberto && (
              <div className="absolute right-0 mt-3 w-52 bg-white rounded-2xl shadow-xl py-2 text-gray-800 z-50 border border-violet-50">
                <button
                  onClick={() => { setPaginaAtual('galeria'); setMenuAberto(false); }}
                  className={`w-full text-left px-4 py-3 text-sm font-medium hover:bg-violet-50/80 transition cursor-pointer flex items-center gap-2 ${paginaAtual === 'galeria' ? 'text-violet-700 bg-violet-50 font-semibold' : ''
                    }`}
                >
                  <span>🏠</span> Galeria de Obras
                </button>
                <button
                  onClick={() => { setPaginaAtual('postagens'); setMenuAberto(false); }}
                  className={`w-full text-left px-4 py-3 text-sm font-medium hover:bg-violet-50/80 transition cursor-pointer flex items-center gap-2 ${paginaAtual === 'postagens' ? 'text-violet-700 bg-violet-50 font-semibold' : ''
                    }`}
                >
                  <span>📸</span> Bastidores & Produção
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <AuthModal
        isOpen={modalAuthAberto}
        modoInicial={modoModal}
        onClose={() => setModalAuthAberto(false)}
        onLoginSuccess={() => setModalAuthAberto(false)}
      />

      {/* Modal de Perfil */}
      <PerfilModal
        isOpen={modalPerfilAberto}
        onClose={() => setModalPerfilAberto(false)}
        usuario={usuario}
      />
    </>
  );
}