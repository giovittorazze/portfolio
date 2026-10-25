import { useState, useEffect } from 'react'
import './App.css'
import { supabase } from './supabaseClient'

import Giovanni from "./assets/img/foto.jpg"

import Cavalo from "./assets/img/cavalo.jpeg"
import Canario from "./assets/img/canarinho.jpeg"
import Aguia from "./assets/img/aguia.jpeg"
import NSAparecida from "./assets/img/nsaparecida.jpeg"
import Iemanja from "./assets/img/iemanja.jpeg"
import MariaMadalena from "./assets/img/mariamadalena.jpeg"
import Oxum from "./assets/img/oxum.jpeg"

interface Comentario {
  id: string | number;
  arte_id: string;
  nome: string;
  email: string;
  texto: string;
  data: string;
}

interface Arte {
  id: string;
  src: string;
  alt: string;
  descricao: string;
  vendido: boolean;
}

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
    vendido: false 
  },
  { 
    id: 'nsaparecida', 
    src: NSAparecida, 
    alt: 'Mandala - Nossa Senhora Aparecida 80x80cm', 
    descricao: 'Mandala sacra dedicada a Nossa Senhora Aparecida, rica em traços circulares, detalhes em azul e rico simbolismo de fé.',
    vendido: false 
  },
  { 
    id: 'iemanja', 
    src: Iemanja, 
    alt: 'Mandala - Iemanjá 60x60cm', 
    descricao: 'Mandala artística em homenagem à Rainha do Mar, com geometria harmônica em tons de azul e elementos marinhos.',
    vendido: false 
  },
  { 
    id: 'mariamadalena', 
    src: MariaMadalena, 
    alt: 'Mandala - Maria Madalena 60x60cm', 
    descricao: 'Mandala com temática sacra inspirada em Maria Madalena, combinando delicadeza, equilíbrio e devoção.',
    vendido: false 
  },
  { 
    id: 'oxum', 
    src: Oxum, 
    alt: 'Mandala - Oxum 60x60cm', 
    descricao: 'Mandala vibrante inspirada em Oxum, destacando geometria fluida em tons dourados e amarelos de harmonia espiritual. (Pequeno detalhe na parte inferior esquerda)',
    vendido: false 
  },
]

// DEFINA A SUA SENHA DE ADMINISTRADOR AQUI:
const SENHA_ADMIN = "19932403";

function App() {
  const [imagemSelecionada, setImagemSelecionada] = useState<Arte | null>(null);
  const [filtroAtivo, setFiltroAtivo] = useState<'todos' | 'mandalas' | 'desenhos'>('todos');

  // Estado para controlar se o Admin está ativado neste navegador
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return localStorage.getItem('giovanni_is_admin') === 'true';
  });

  const [likes, setLikes] = useState<{ [key: string]: number }>({});
  const [userLikes, setUserLikes] = useState<string[]>(() => {
    const salvos = localStorage.getItem('giovanni_artes_user_likes');
    return salvos ? JSON.parse(salvos) : [];
  });
  const [comentarios, setComentarios] = useState<{ [key: string]: Comentario[] }>({});

  const [meusComentariosIds, setMeusComentariosIds] = useState<(string | number)[]>(() => {
    const salvos = localStorage.getItem('giovanni_meus_comentarios_ids');
    return salvos ? JSON.parse(salvos) : [];
  });

  const [novoNome, setNovoNome] = useState('');
  const [novoEmail, setNovoEmail] = useState('');
  const [novoTexto, setNovoTexto] = useState('');

  useEffect(() => {
    async function carregarDadosDoBanco() {
      try {
        const { data: likesData } = await supabase.from('artes_likes').select('*');
        if (likesData) {
          const likesObj: { [key: string]: number } = {};
          likesData.forEach((item: any) => {
            likesObj[item.id] = item.likes_count;
          });
          setLikes(likesObj);
        }

        const { data: comentsData } = await supabase.from('artes_comentarios').select('*');
        if (comentsData) {
          const comentsObj: { [key: string]: Comentario[] } = {};
          comentsData.forEach((c: Comentario) => {
            if (!comentsObj[c.arte_id]) {
              comentsObj[c.arte_id] = [];
            }
            comentsObj[c.arte_id].push(c);
          });
          setComentarios(comentsObj);
        }
      } catch (err) {
        console.error('Erro ao carregar dados do Supabase:', err);
      }
    }

    carregarDadosDoBanco();
  }, []);

  useEffect(() => {
    localStorage.setItem('giovanni_artes_user_likes', JSON.stringify(userLikes));
  }, [userLikes]);

  useEffect(() => {
    localStorage.setItem('giovanni_meus_comentarios_ids', JSON.stringify(meusComentariosIds));
  }, [meusComentariosIds]);

  const toggleAdmin = () => {
    if (isAdmin) {
      setIsAdmin(false);
      localStorage.removeItem('giovanni_is_admin');
      alert('Modo Administrador desativado.');
    } else {
      const senhaInformada = prompt('Digite a senha de administrador:');
      if (senhaInformada === SENHA_ADMIN) {
        setIsAdmin(true);
        localStorage.setItem('giovanni_is_admin', 'true');
        alert('Modo Administrador ativado com sucesso! Você agora pode apagar qualquer comentário.');
      } else if (senhaInformada !== null) {
        alert('Senha incorreta!');
      }
    }
  };

  const toggleCurtir = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    const jaCurtiu = userLikes.includes(id);
    const atualLikes = likes[id] || 0;
    let novoTotal = jaCurtiu ? Math.max(0, atualLikes - 1) : atualLikes + 1;

    if (jaCurtiu) {
      setUserLikes(userLikes.filter(item => item !== id));
    } else {
      setUserLikes([...userLikes, id]);
    }

    setLikes(prev => ({ ...prev, [id]: novoTotal }));

    try {
      await supabase
        .from('artes_likes')
        .upsert({ id: id, likes_count: novoTotal }, { onConflict: 'id' });
    } catch (err) {
      console.error('Erro de conexão:', err);
    }
  };

  const handleAdicionarComentario = async (id: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!novoNome.trim() || !novoEmail.trim() || !novoTexto.trim()) return;

    const novoComentarioParaBanco = {
      arte_id: id,
      nome: novoNome.trim(),
      email: novoEmail.trim(),
      texto: novoTexto.trim(),
      data: new Date().toLocaleDateString('pt-BR')
    };

    try {
      const { data, error } = await supabase
        .from('artes_comentarios')
        .insert([novoComentarioParaBanco])
        .select();

      if (!error && data) {
        const comentarioCriado = data[0];
        setComentarios(prev => ({
          ...prev,
          [id]: [...(prev[id] || []), comentarioCriado]
        }));

        setMeusComentariosIds(prev => [...prev, comentarioCriado.id]);

        setNovoNome('');
        setNovoEmail('');
        setNovoTexto('');
      }
    } catch (err) {
      console.error('Erro de conexão ao comentar:', err);
    }
  };

  const handleDeletarComentario = async (arteId: string, comentarioId: string | number) => {
    const confirmar = window.confirm('Tem certeza de que deseja apagar este comentário?');
    if (!confirmar) return;

    try {
      const { error } = await supabase
        .from('artes_comentarios')
        .delete()
        .eq('id', comentarioId);

      if (!error) {
        setComentarios(prev => ({
          ...prev,
          [arteId]: (prev[arteId] || []).filter(c => c.id !== comentarioId)
        }));

        setMeusComentariosIds(prev => prev.filter(id => id !== comentarioId));
      } else {
        alert('Erro ao apagar o comentário. Tente novamente.');
      }
    } catch (err) {
      console.error('Erro ao deletar comentário:', err);
    }
  };

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
      alert(`Link direto da obra "${arte.alt}" copiado para a área de transferência!`);
    }
  };

  const artesFiltradas = galeriaArtes.filter((arte) => {
    const ehMandala = arte.alt.toLowerCase().includes('mandala');
    if (filtroAtivo === 'mandalas') return ehMandala;
    if (filtroAtivo === 'desenhos') return !ehMandala;
    return true;
  });

  return (
    <div className="min-h-screen bg-white">
      <header className="fixed top-0 left-0 w-full h-20 bg-gradient-to-r from-violet-500 to-cyan-500 flex items-center pl-6 sm:pl-10 shadow-lg z-40 text-white font-['amoresa'] text-2xl sm:text-3xl">
        Giovanni Vittorazze
      </header>

      <div className="flex flex-col lg:flex-row pt-20 min-h-screen">
        <main className="flex-1 p-4 sm:p-6 flex flex-col gap-6 lg:mr-80">
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <span className="text-xs font-bold text-gray-500 mr-1 uppercase tracking-wider">Filtrar:</span>
            <button
              onClick={() => setFiltroAtivo('todos')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                filtroAtivo === 'todos' ? 'bg-violet-600 text-white shadow' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFiltroAtivo('mandalas')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                filtroAtivo === 'mandalas' ? 'bg-violet-600 text-white shadow' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Mandalas
            </button>
            <button
              onClick={() => setFiltroAtivo('desenhos')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                filtroAtivo === 'desenhos' ? 'bg-violet-600 text-white shadow' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Desenhos
            </button>
          </div>

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

                    <div className="px-4 py-3 bg-white flex items-center justify-between border-t border-gray-200">
                      <span className="text-sm font-bold text-gray-800">{arte.alt}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">💬 {totalComentarios}</span>
                        <button 
                          onClick={(e) => toggleCurtir(arte.id, e)}
                          className={`flex items-center gap-1.5 px-3 py-1 rounded-full transition text-sm font-semibold cursor-pointer active:scale-95 ${
                            jaCurtiu ? 'bg-red-600 text-white shadow-inner' : 'bg-red-50 text-red-600 hover:bg-red-100'
                          }`}
                        >
                          <span>{jaCurtiu ? '❤️' : '🤍'}</span>
                          <span>{likes[arte.id] || 0}</span>
                        </button>
                      </div>
                    </div>

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
            <p>Na pintura, eu faço mandalas de caráter religioso, pois é o que mais combina com o tema! Deixo aqui meu portfólio para apreciação, mas também faço por encomenda, chama no WhatsApp.</p>
          </div>

          <div className="mt-6 lg:mt-auto pt-4 border-t border-gray-400 text-center flex flex-col gap-2">
            <div>
              <span className="font-bold block text-gray-900 text-sm">Localização:</span>
              <div className="text-sm font-medium text-gray-800">
                📍 Uberaba / MG
              </div>
            </div>
            <div className="pt-2 border-t border-gray-300">
              <span className="font-bold block text-gray-900 mb-1 text-sm">WhatsApp / Contato:</span>
              <a 
                href="https://wa.me/5534998641993" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-flex items-center justify-center gap-1.5 text-sm font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 py-1.5 px-3 rounded-full transition"
              >
                <span>💬</span> (34) 99864-1993
              </a>
            </div>

            {/* Botão sutil de Painel de Administrador */}
            <div className="pt-3">
              <button 
                onClick={toggleAdmin}
                className="text-[10px] text-gray-500 hover:text-gray-700 underline cursor-pointer"
              >
                {isAdmin ? '🔓 Desativar Modo Admin' : '🔒 Áreas do Artista'}
              </button>
            </div>
          </div>
        </aside>
      </div>

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
                
                <div className="p-4 bg-white flex flex-col gap-3 border-b">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-800 text-base">{imagemSelecionada.alt}</span>
                    <button 
                      onClick={() => toggleCurtir(imagemSelecionada.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full transition font-bold cursor-pointer active:scale-95 ${
                        jaCurtiuModal ? 'bg-red-600 text-white shadow-inner' : 'bg-red-50 text-red-600 hover:bg-red-100'
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

                <div className="p-4 bg-gray-50 flex flex-col gap-4">
                  <h3 className="font-bold text-gray-800 text-sm">Comentários ({listaComentarios.length})</h3>

                  <div className="flex flex-col gap-2 max-h-40 overflow-y-auto pr-1">
                    {listaComentarios.length === 0 ? (
                      <p className="text-xs text-gray-500 italic">Nenhum comentário ainda. Seja o primeiro a comentar!</p>
                    ) : (
                      listaComentarios.map((c) => {
                        const souDonoDoComentario = meusComentariosIds.includes(c.id);
                        // O botão de deletar só aparece se for o próprio criador OU se o Modo Admin estiver ativado
                        const podeDeletar = souDonoDoComentario || isAdmin;

                        return (
                          <div key={c.id} className="bg-white p-3 rounded border border-gray-200 text-xs flex flex-col gap-1 shadow-xs relative">
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-gray-900">{c.nome}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-gray-400">{c.data}</span>
                                
                                {podeDeletar && (
                                  <button
                                    onClick={() => handleDeletarComentario(imagemSelecionada.id, c.id)}
                                    className="text-red-500 hover:text-red-700 text-xs font-bold ml-1 cursor-pointer bg-red-50 px-2 py-0.5 rounded hover:bg-red-100 transition"
                                    title="Apagar comentário"
                                  >
                                    🗑️ Deletar
                                  </button>
                                )}
                              </div>
                            </div>
                            <p className="text-gray-700">{c.texto}</p>
                          </div>
                        );
                      })
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