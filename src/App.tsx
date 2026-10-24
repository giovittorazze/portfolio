import { useState, useEffect } from 'react'
import './App.css'

import Giovanni from "./assets/img/foto.jpg"

import Cavalo from "./assets/img/cavalo.jpeg"
import Canario from "./assets/img/canarinho.jpeg"
import Aguia from "./assets/img/aguia.jpeg"
import NSAparecida from "./assets/img/nsaparecida.jpeg"
import Iemanja from "./assets/img/iemanja.jpeg"
import MariaMadalena from "./assets/img/mariamadalena.jpeg"
import Oxum from "./assets/img/oxum.jpeg"

// Interface para estruturar os comentários
interface Comentario {
  id: string;
  nome: string;
  email: string;
  texto: string;
  data: string;
}

// Interface para as artes
interface Arte {
  id: string;
  src: string;
  alt: string;
  descricao: string;
  vendido: boolean;
}

// Lista de obras
const galeriaArtes: Arte[] = [
  { 
    id: 'cavalo', 
    src: Cavalo, 
    alt: 'Cavalo A4', 
    descricao: 'Arte realista de um cavalo focando nos detalhes minuciosos e força da expressão.',
    vendido: false 
  },
  { 
    id: 'canario', 
    src: Canario, 
    alt: 'Canarinho A4', 
    descricao: 'Arte realista de um canarinho focando nos detalhes minuciosos das penas e cores vibrantes.',
    vendido: false 
  },
  { 
    id: 'aguia', 
    src: Aguia, 
    alt: 'Águia A3', 
    descricao: 'Desenho detalhado de uma águia imperial demonstrando toda a sua imponência e olhar atento.',
    vendido: true 
  },
  { 
    id: 'nsaparecida', 
    src: NSAparecida, 
    alt: 'Mandala - Nossa Senhora Aparecida 80x80cm', 
    descricao: 'Mandala sacra dedicada a Nossa Senhora Aparecida, rica em detalhes e simbolismo religioso.',
    vendido: false 
  },
  { 
    id: 'iemanja', 
    src: Iemanja, 
    alt: 'Mandala - Iemanjá 60x60cm', 
    descricao: 'Mandala artística em homenagem à rainha do mar, com tons azulados e elementos marinhos.',
    vendido: false 
  },
  { 
    id: 'mariamadalena', 
    src: MariaMadalena, 
    alt: 'Mandala - Maria Madalena 60x60cm', 
    descricao: 'Mandala com temática de Maria Madalena, expressando delicadeza, devoção e força.',
    vendido: false 
  },
  { 
    id: 'oxum', 
    src: Oxum, 
    alt: 'Mandala - Oxum 60x60cm', 
    descricao: 'Mandala inspirada na energia de Oxum, destacando tons dourados e harmonia espiritual.',
    vendido: false 
  },
]

function App() {
  const [imagemSelecionada, setImagemSelecionada] = useState<Arte | null>(null);
  
  // Estado para controlar o filtro ativo ('todos', 'mandalas', 'desenhos')
  const [filtroAtivo, setFiltroAtivo] = useState<'todos' | 'mandalas' | 'desenhos'>('todos');

  // Contador total de curtidas de cada arte
  const [likes, setLikes] = useState<{ [key: string]: number }>(() => {
    const salvos = localStorage.getItem('giovanni_artes_likes');
    if (salvos) {
      try { return JSON.parse(salvos); } catch { return {}; }
    }
    return {};
  });

  // Lista de IDs das artes que ESTE aparelho já curtiu
  const [userLikes, setUserLikes] = useState<string[]>(() => {
    const salvos = localStorage.getItem('giovanni_artes_user_likes');
    if (salvos) {
      try { return JSON.parse(salvos); } catch { return []; }
    }
    return [];
  });

  // Estado para armazenar os comentários de cada obra
  const [comentarios, setComentarios] = useState<{ [key: string]: Comentario[] }>(() => {
    const salvos = localStorage.getItem('giovanni_artes_comentarios');
    if (salvos) {
      try { return JSON.parse(salvos); } catch { return {}; }
    }
    return {};
  });

  // Estados locais para o formulário de novo comentário dentro do modal
  const [novoNome, setNovoNome] = useState('');
  const [novoEmail, setNovoEmail] = useState('');
  const [novoTexto, setNovoTexto] = useState('');

  // Ao carregar o site, verifica se há um parâmetro na URL para abrir direto a arte
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const obraId = params.get('obra');
    if (obraId) {
      const arteEncontrada = galeriaArtes.find(a => a.id === obraId);
      if (arteEncontrada) {
        setImagemSelecionada(arteEncontrada);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('giovanni_artes_likes', JSON.stringify(likes));
  }, [likes]);

  useEffect(() => {
    localStorage.setItem('giovanni_artes_user_likes', JSON.stringify(userLikes));
  }, [userLikes]);

  useEffect(() => {
    localStorage.setItem('giovanni_artes_comentarios', JSON.stringify(comentarios));
  }, [comentarios]);

  const toggleCurtir = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    const jaCurtiu = userLikes.includes(id);

    if (jaCurtiu) {
      setUserLikes(userLikes.filter(item => item !== id));
      setLikes(prev => ({
        ...prev,
        [id]: Math.max(0, (prev[id] || 0) - 1)
      }));
    } else {
      setUserLikes([...userLikes, id]);
      setLikes(prev => ({
        ...prev,
        [id]: (prev[id] || 0) + 1
      }));
    }
  };

  const handleAdicionarComentario = (id: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!novoNome.trim() || !novoEmail.trim() || !novoTexto.trim()) return;

    const novoComentario: Comentario = {
      id: Date.now().toString(),
      nome: novoNome.trim(),
      email: novoEmail.trim(),
      texto: novoTexto.trim(),
      data: new Date().toLocaleDateString('pt-BR')
    };

    setComentarios(prev => ({
      ...prev,
      [id]: [...(prev[id] || []), novoComentario]
    }));

    setNovoNome('');
    setNovoEmail('');
    setNovoTexto('');
  };

  const fecharModal = () => {
    setImagemSelecionada(null);
    window.history.replaceState({}, '', window.location.pathname);
  };

  const compartilharArte = (arte: Arte) => {
    const linkEspecifico = `https://giovittorazze.github.io/portfolio/?obra=${arte.id}`;
    const textoCompartilhamento = `🎨 Confira a obra "${arte.alt}" de Giovanni Vittorazze!\n\n"${arte.descricao}"\n\nVeja os detalhes e deixe seu comentário aqui: ${linkEspecifico}`;

    if (navigator.share) {
      navigator.share({
        title: arte.alt,
        text: textoCompartilhamento,
        url: linkEspecifico,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(textoCompartilhamento);
      alert(`Link direto da obra "${arte.alt}" e créditos copiados para a área de transferência!`);
    }
  };

  // Lógica de filtragem das artes com base no botão selecionado
  const artesFiltradas = galeriaArtes.filter((arte) => {
    const ehMandala = arte.alt.toLowerCase().includes('mandala');
    if (filtroAtivo === 'mandalas') return ehMandala;
    if (filtroAtivo === 'desenhos') return !ehMandala;
    return true; // 'todos'
  });

  return (
    <div className="min-h-screen bg-white">
      {/* Menu Fixo Superior */}
      <header className="fixed top-0 left-0 w-full h-20 bg-gradient-to-r from-violet-500 to-cyan-500 flex items-center pl-6 sm:pl-10 shadow-lg z-40 text-white font-['amoresa'] text-2xl sm:text-3xl">
        Giovanni Vittorazze
      </header>

      {/* Container Principal */}
      <div className="flex flex-col lg:flex-row pt-20 min-h-screen">
        
        {/* Galeria de Artes (Centro) */}
        <main className="flex-1 p-4 sm:p-6 flex flex-col gap-6 lg:mr-80">
          
          {/* Botões de Filtro */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <span className="text-xs font-bold text-gray-500 mr-1 uppercase tracking-wider">Filtrar:</span>
            <button
              onClick={() => setFiltroAtivo('todos')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                filtroAtivo === 'todos'
                  ? 'bg-violet-600 text-white shadow'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFiltroAtivo('mandalas')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                filtroAtivo === 'mandalas'
                  ? 'bg-violet-600 text-white shadow'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Mandalas
            </button>
            <button
              onClick={() => setFiltroAtivo('desenhos')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                filtroAtivo === 'desenhos'
                  ? 'bg-violet-600 text-white shadow'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Desenhos
            </button>
          </div>

          {/* Grid de Artes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {artesFiltradas.length === 0 ? (
              <p className="text-sm text-gray-500 italic col-span-full py-10 text-center">Nenhuma arte encontrada nesta categoria.</p>
            ) : (
              artesFiltradas.map((arte) => {
                const jaCurtiu = userLikes.includes(arte.id);
                const totalComentarios = (comentarios[arte.id] || []).length;
                return (
                  <div 
                    key={arte.id}
                    className="bg-gray-100 rounded-lg overflow-hidden shadow-md cursor-pointer group flex flex-col relative"
                    onClick={() => setImagemSelecionada(arte)}
                  >
                    <div className="overflow-hidden h-64 relative">
                      {arte.vendido ? (
                        <span className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded shadow-md uppercase tracking-wider z-10">
                          Vendida
                        </span>
                      ) : (
                        <span className="absolute top-3 left-3 bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded shadow-md uppercase tracking-wider z-10">
                          Disponível
                        </span>
                      )}

                      <img 
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300" 
                        src={arte.src} 
                        alt={arte.alt} 
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-sm font-semibold gap-1">
                        🔍 Clique para ampliar
                      </div>
                    </div>

                    {/* Barra de Curtidas no Card */}
                    <div className="px-4 py-3 bg-white flex items-center justify-between border-t border-gray-200">
                      <span className="text-sm font-bold text-gray-800">{arte.alt}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">💬 {totalComentarios}</span>
                        <button 
                          onClick={(e) => toggleCurtir(arte.id, e)}
                          className={`flex items-center gap-1.5 px-3 py-1 rounded-full transition text-sm font-semibold cursor-pointer active:scale-95 ${
                            jaCurtiu 
                              ? 'bg-red-600 text-white shadow-inner' 
                              : 'bg-red-50 text-red-600 hover:bg-red-100'
                          }`}
                        >
                          <span>{jaCurtiu ? '❤️' : '🤍'}</span>
                          <span>{likes[arte.id] || 0}</span>
                        </button>
                      </div>
                    </div>

                    {/* Descrição Breve */}
                    <div className="px-4 pb-3 bg-white">
                      <p className="text-xs text-gray-600 line-clamp-2 w-full">
                        {arte.descricao}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </main>

        {/* Barra Lateral / Contato (Direita) */}
        <aside className="w-full lg:w-80 bg-[#d9d9d9] p-6 flex flex-col text-gray-800 shadow-lg lg:fixed lg:right-0 lg:top-20 lg:h-[calc(100vh-5rem)] lg:overflow-y-auto">
          <div className="flex items-center gap-3 mb-4">
            <img className="rounded-full w-16 h-16 object-cover shadow" src={Giovanni} alt="Giovanni" />
            <div>
              <p className="text-sm">Olá! Eu sou</p>
              <h2 className="font-bold text-base text-gray-900">Giovanni Vittorazze</h2>
            </div>
          </div>

          <div className="text-xs sm:text-sm text-gray-700 leading-relaxed flex flex-col gap-3">
            <p>Eu sou um aprendiz da arte, amo a arte realista mas estou sempre buscando aprender novas técnicas para expandir minha criatividade.</p>
            <p>Na pintura, eu faço mandalas de caráter religioso, pois é o que mais combina com o tema! Deixo aqui meu portfólio para apreciação, mas também pego encomendas.</p>
          </div>

          <div className="mt-6 lg:mt-auto pt-4 border-t border-gray-400 text-center flex flex-col gap-2">
            <div>
              <span className="font-bold block text-gray-900 text-sm">Localização:</span>
              <div className="text-sm font-medium text-gray-800">
                📍 Uberaba / MG
              </div>
            </div>
            <div className="pt-2 border-t border-gray-300">
              <span className="font-bold block text-gray-900 mb-1 text-sm">Contato:</span>
              <div className="text-sm font-medium text-gray-800">
                (34) 99864-1993
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Pop-up / Modal */}
      {imagemSelecionada && (() => {
        const jaCurtiuModal = userLikes.includes(imagemSelecionada.id);
        const listaComentarios = comentarios[imagemSelecionada.id] || [];

        return (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="relative max-w-2xl w-full max-h-[90vh] bg-white rounded-lg overflow-hidden shadow-2xl flex flex-col">
              <button 
                onClick={fecharModal}
                className="absolute top-3 right-3 text-white text-2xl font-bold bg-black/60 w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-600 transition cursor-pointer z-10"
              >
                &times;
              </button>

              <div className="overflow-y-auto max-h-[90vh]">
                <div className="bg-black flex items-center justify-center max-h-[55vh] relative">
                  {imagemSelecionada.vendido ? (
                    <span className="absolute top-4 left-4 bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded shadow-md uppercase tracking-wider z-10">
                      Vendida
                    </span>
                  ) : (
                    <span className="absolute top-4 left-4 bg-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded shadow-md uppercase tracking-wider z-10">
                      Disponível
                    </span>
                  )}

                  <img 
                    src={imagemSelecionada.src} 
                    alt={imagemSelecionada.alt} 
                    className="max-w-full max-h-[55vh] object-contain"
                  />
                </div>
                
                {/* Detalhes da Obra */}
                <div className="p-4 bg-white flex flex-col gap-3 border-b">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-800 text-base">{imagemSelecionada.alt}</span>
                    <button 
                      onClick={() => toggleCurtir(imagemSelecionada.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full transition font-bold cursor-pointer active:scale-95 ${
                        jaCurtiuModal 
                          ? 'bg-red-600 text-white shadow-inner' 
                          : 'bg-red-50 text-red-600 hover:bg-red-100'
                      }`}
                    >
                      <span className="text-lg">{jaCurtiuModal ? '❤️' : '🤍'}</span>
                      <span>{likes[imagemSelecionada.id] || 0} Curtidas</span>
                    </button>
                  </div>

                  <p className="text-xs sm:text-sm text-gray-600 w-full">
                    {imagemSelecionada.descricao}
                  </p>

                  <button
                    onClick={() => compartilharArte(imagemSelecionada)}
                    className="self-start flex items-center gap-2 px-3 py-1.5 bg-violet-50 hover:bg-violet-100 text-violet-700 text-xs font-bold rounded-md transition cursor-pointer"
                  >
                    <span>📤</span> Compartilhar esta arte específica
                  </button>
                </div>

                {/* Seção de Comentários */}
                <div className="p-4 bg-gray-50 flex flex-col gap-4">
                  <h3 className="font-bold text-gray-800 text-sm">Comentários ({listaComentarios.length})</h3>

                  <div className="flex flex-col gap-2 max-h-40 overflow-y-auto pr-1">
                    {listaComentarios.length === 0 ? (
                      <p className="text-xs text-gray-500 italic">Nenhum comentário ainda. Seja o primeiro a comentar!</p>
                    ) : (
                      listaComentarios.map((c) => (
                        <div key={c.id} className="bg-white p-3 rounded border border-gray-200 text-xs flex flex-col gap-1 shadow-xs">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-gray-900">{c.nome}</span>
                            <span className="text-[10px] text-gray-400">{c.data}</span>
                          </div>
                          <p className="text-gray-700">{c.texto}</p>
                        </div>
                      ))
                    )}
                  </div>

                  <form onSubmit={(e) => handleAdicionarComentario(imagemSelecionada.id, e)} className="flex flex-col gap-2 pt-2 border-t border-gray-200">
                    <span className="text-xs font-semibold text-gray-700">Deixe seu comentário:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input 
                        type="text" 
                        placeholder="Seu nome" 
                        value={novoNome}
                        onChange={(e) => setNovoNome(e.target.value)}
                        className="text-xs p-2 rounded border border-gray-300 bg-white focus:outline-none focus:border-violet-500"
                        required
                      />
                      <input 
                        type="email" 
                        placeholder="Seu e-mail (não será publicado)" 
                        value={novoEmail}
                        onChange={(e) => setNovoEmail(e.target.value)}
                        className="text-xs p-2 rounded border border-gray-300 bg-white focus:outline-none focus:border-violet-500"
                        required
                      />
                    </div>
                    <textarea 
                        placeholder="Escreva sua mensagem..." 
                        value={novoTexto}
                        onChange={(e) => setNovoTexto(e.target.value)}
                        rows={2}
                        className="text-xs p-2 rounded border border-gray-300 bg-white focus:outline-none focus:border-violet-500 resize-none"
                        required
                    ></textarea>
                    <button 
                      type="submit"
                      className="bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold py-2 px-4 rounded transition cursor-pointer active:scale-95 self-end"
                    >
                      Enviar Comentário
                    </button>
                  </form>
                </div>

              </div>
            </div>
          </div>
        );
      })()}
    </div>
  )
}

export default App