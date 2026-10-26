interface HeaderProps {
  paginaAtual: 'galeria' | 'postagens';
  setPaginaAtual: (pagina: 'galeria' | 'postagens') => void;
  menuAberto: boolean;
  setMenuAberto: (aberto: boolean) => void;
}

export function Header({ paginaAtual, setPaginaAtual, menuAberto, setMenuAberto }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 w-full h-20 bg-linear-to-r from-violet-600 via-purple-600 to-cyan-600 flex items-center justify-between px-6 sm:px-10 shadow-md z-40 text-white">
      <span
        onClick={() => {
          if (paginaAtual !== 'galeria') {
            setPaginaAtual('galeria');
          }
        }}
        className={`font-['amoresa'] text-2xl sm:text-3xl tracking-wide transition ${
          paginaAtual !== 'galeria' ? 'cursor-pointer hover:opacity-80 active:scale-98' : 'cursor-default'
        }`}
        title={paginaAtual !== 'galeria' ? 'Voltar para a Galeria' : ''}
      >
        Giovanni Vittorazze
      </span>

      <div className="relative">
        <button
          onClick={() => setMenuAberto(!menuAberto)}
          className="flex flex-col justify-center items-center w-10 h-10 rounded-xl bg-white/15 hover:bg-white/25 transition cursor-pointer backdrop-blur-sm"
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
              className={`w-full text-left px-4 py-3 text-sm font-medium hover:bg-violet-50/80 transition cursor-pointer flex items-center gap-2 ${paginaAtual === 'galeria' ? 'text-violet-700 bg-violet-50 font-semibold' : ''}`}
            >
              <span>🏠</span> Galeria de Obras
            </button>
            <button
              onClick={() => { setPaginaAtual('postagens'); setMenuAberto(false); }}
              className={`w-full text-left px-4 py-3 text-sm font-medium hover:bg-violet-50/80 transition cursor-pointer flex items-center gap-2 ${paginaAtual === 'postagens' ? 'text-violet-700 bg-violet-50 font-semibold' : ''}`}
            >
              <span>📸</span> Bastidores & Produção
            </button>
          </div>
        )}
      </div>
    </header>
  );
}