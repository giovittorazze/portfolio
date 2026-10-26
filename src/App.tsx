import { useState, useEffect } from 'react'
import './App.css'
import { supabase } from './supabaseClient'
import type { Comentario, Arte, Postagem } from './types'
import { galeriaArtes } from './data/artes'
import { galeriaPostagens } from './data/postagens'
import { Header } from './components/Header'
import { Sidebar } from './components/Sidebar'

import Giovanni from "./assets/img/foto.jpg"

const SENHA_ADMIN = "19932403";

function App() {
  const [paginaAtual, setPaginaAtual] = useState<'galeria' | 'postagens'>('galeria');
  const [menuAberto, setMenuAberto] = useState(false);

  const [imagemSelecionada, setImagemSelecionada] = useState<Arte | null>(null);
  const [postagemSelecionada, setPostagemSelecionada] = useState<Postagem | null>(null);
  const [indiceFotoAtual, setIndiceFotoAtual] = useState<number>(0);

  const [filtroAtivo, setFiltroAtivo] = useState<'todos' | 'mandalas' | 'desenhos' | 'mobiles'>('todos');

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

  const [postLikes, setPostLikes] = useState<{ [key: string]: number }>({});
  const [userPostLikes, setUserPostLikes] = useState<string[]>(() => {
    const salvos = localStorage.getItem('giovanni_posts_user_likes');
    return salvos ? JSON.parse(salvos) : [];
  });
  const [postComentarios, setPostComentarios] = useState<{ [key: string]: Comentario[] }>({});
  const [meusPostComentariosIds, setMeusPostComentariosIds] = useState<(string | number)[]>(() => {
    const salvos = localStorage.getItem('giovanni_meus_posts_comentarios_ids');
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
          likesData.forEach((item: any) => { likesObj[item.id] = item.likes_count; });
          setLikes(likesObj);
        }

        const { data: comentsData } = await supabase.from('artes_comentarios').select('*');
        if (comentsData) {
          const comentsObj: { [key: string]: Comentario[] } = {};
          comentsData.forEach((c: Comentario) => {
            if (!comentsObj[c.arte_id]) comentsObj[c.arte_id] = [];
            comentsObj[c.arte_id].push(c);
          });
          setComentarios(comentsObj);
        }

        const { data: pLikesData } = await supabase.from('postagens_likes').select('*');
        if (pLikesData) {
          const pLikesObj: { [key: string]: number } = {};
          pLikesData.forEach((item: any) => { pLikesObj[item.id] = item.likes_count; });
          setPostLikes(pLikesObj);
        }

        const { data: pComentsData } = await supabase.from('postagens_comentarios').select('*');
        if (pComentsData) {
          const pComentsObj: { [key: string]: Comentario[] } = {};
          pComentsData.forEach((c: any) => {
            if (!pComentsObj[c.post_id]) pComentsObj[c.post_id] = [];
            pComentsObj[c.post_id].push({
              id: c.id,
              arte_id: c.post_id,
              nome: c.nome,
              email: c.email,
              texto: c.texto,
              data: c.data
            });
          });
          setPostComentarios(pComentsObj);
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

  useEffect(() => {
    localStorage.setItem('giovanni_posts_user_likes', JSON.stringify(userPostLikes));
  }, [userPostLikes]);

  useEffect(() => {
    localStorage.setItem('giovanni_meus_posts_comentarios_ids', JSON.stringify(meusPostComentariosIds));
  }, [meusPostComentariosIds]);

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

  const toggleCurtirArte = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const jaCurtiu = userLikes.includes(id);
    const atualLikes = likes[id] || 0;
    let novoTotal = jaCurtiu ? Math.max(0, atualLikes - 1) : atualLikes + 1;

    if (jaCurtiu) setUserLikes(userLikes.filter(item => item !== id));
    else setUserLikes([...userLikes, id]);

    setLikes(prev => ({ ...prev, [id]: novoTotal }));

    try {
      await supabase.from('artes_likes').upsert({ id: id, likes_count: novoTotal }, { onConflict: 'id' });
    } catch (err) { console.error(err); }
  };

  const toggleCurtirPost = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const jaCurtiu = userPostLikes.includes(id);
    const atualLikes = postLikes[id] || 0;
    let novoTotal = jaCurtiu ? Math.max(0, atualLikes - 1) : atualLikes + 1;

    if (jaCurtiu) setUserPostLikes(userPostLikes.filter(item => item !== id));
    else setUserPostLikes([...userPostLikes, id]);

    setPostLikes(prev => ({ ...prev, [id]: novoTotal }));

    try {
      await supabase.from('postagens_likes').upsert({ id: id, likes_count: novoTotal }, { onConflict: 'id' });
    } catch (err) { console.error(err); }
  };

  const handleAdicionarComentarioArte = async (id: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!novoNome.trim() || !novoEmail.trim() || !novoTexto.trim()) return;

    const novoComentario = {
      arte_id: id,
      nome: novoNome.trim(),
      email: novoEmail.trim(),
      texto: novoTexto.trim(),
      data: new Date().toLocaleDateString('pt-BR')
    };

    try {
      const { data, error } = await supabase.from('artes_comentarios').insert([novoComentario]).select();
      if (!error && data) {
        const criado = data[0];
        setComentarios(prev => ({ ...prev, [id]: [...(prev[id] || []), criado] }));
        setMeusComentariosIds(prev => [...prev, criado.id]);
        setNovoNome(''); setNovoEmail(''); setNovoTexto('');
      }
    } catch (err) { console.error(err); }
  };

  const handleAdicionarComentarioPost = async (id: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!novoNome.trim() || !novoEmail.trim() || !novoTexto.trim()) return;

    const novoComentario = {
      post_id: id,
      nome: novoNome.trim(),
      email: novoEmail.trim(),
      texto: novoTexto.trim(),
      data: new Date().toLocaleDateString('pt-BR')
    };

    try {
      const { data, error } = await supabase.from('postagens_comentarios').insert([novoComentario]).select();
      if (!error && data) {
        const criado = data[0];
        const formatado: Comentario = {
          id: criado.id,
          arte_id: criado.post_id,
          nome: criado.nome,
          email: criado.email,
          texto: criado.texto,
          data: criado.data
        };
        setPostComentarios(prev => ({ ...prev, [id]: [...(prev[id] || []), formatado] }));
        setMeusPostComentariosIds(prev => [...prev, criado.id]);
        setNovoNome(''); setNovoEmail(''); setNovoTexto('');
      }
    } catch (err) { console.error(err); }
  };

  const handleDeletarComentarioArte = async (arteId: string, comentarioId: string | number) => {
    if (!window.confirm('Deseja apagar este comentário?')) return;
    try {
      const { error } = await supabase.from('artes_comentarios').delete().eq('id', comentarioId);
      if (!error) {
        setComentarios(prev => ({ ...prev, [arteId]: (prev[arteId] || []).filter(c => c.id !== comentarioId) }));
        setMeusComentariosIds(prev => prev.filter(id => id !== comentarioId));
      }
    } catch (err) { console.error(err); }
  };

  const handleDeletarComentarioPost = async (postId: string, comentarioId: string | number) => {
    if (!window.confirm('Deseja apagar este comentário?')) return;
    try {
      const { error } = await supabase.from('postagens_comentarios').delete().eq('id', comentarioId);
      if (!error) {
        setPostComentarios(prev => ({ ...prev, [postId]: (prev[postId] || []).filter(c => c.id !== comentarioId) }));
        setMeusPostComentariosIds(prev => prev.filter(id => id !== comentarioId));
      }
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const obraId = params.get('obra');
    if (obraId) {
      const arteEncontrada = galeriaArtes.find(a => a.id === obraId);
      if (arteEncontrada) setImagemSelecionada(arteEncontrada);
    }
  }, []);

  const compartilharArte = (arte: Arte) => {
    const linkEspecifico = `https://giovittorazze.github.io/portfolio/?obra=${arte.id}`;
    const textoCompartilhamento = `🎨 Confira a obra "${arte.alt}" de Giovanni Vittorazze!\n\n"${arte.descricao}"\n\nVeja os detalhes aqui: ${linkEspecifico}`;

    if (navigator.share) {
      navigator.share({ title: arte.alt, text: textoCompartilhamento, url: linkEspecifico }).catch(() => { });
    } else {
      navigator.clipboard.writeText(textoCompartilhamento);
      alert('Link direto copiado para a área de transferência!');
    }
  };

  const artesFiltradas = galeriaArtes.filter((arte) => {
    const altLower = arte.alt.toLowerCase();
    const idLower = arte.id.toLowerCase();

    const ehMandala = altLower.includes('mandala');
    const ehMobile = altLower.includes('mobile') || altLower.includes('móbile') || idLower.startsWith('mobi');

    if (filtroAtivo === 'mandalas') return ehMandala;
    if (filtroAtivo === 'mobiles') return ehMobile;
    if (filtroAtivo === 'desenhos') return !ehMandala && !ehMobile;
    return true;
  });

  const postagensOrdenadas = [...galeriaPostagens].sort((a, b) => {
    const [diaA, mesA, anoA] = a.data.split('/').map(Number);
    const [diaB, mesB, anoB] = b.data.split('/').map(Number);
    return new Date(anoB, mesB - 1, diaB).getTime() - new Date(anoA, mesA - 1, diaA).getTime();
  });

  return (
    <div className="min-h-screen bg-[#faf9f6]">
      <Header
        paginaAtual={paginaAtual}
        setPaginaAtual={setPaginaAtual}
        menuAberto={menuAberto}
        setMenuAberto={setMenuAberto}
      />

      <div className="flex flex-col lg:flex-row pt-20 min-h-screen">
        <main className="flex-1 p-4 sm:p-8 flex flex-col gap-6 lg:mr-80">
          {paginaAtual === 'galeria' ? (
            <>
              {/* BARRA DE FILTROS */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                <span className="text-xs font-semibold text-gray-500 mr-1 uppercase tracking-wider">Filtrar:</span>
                <button onClick={() => setFiltroAtivo('todos')} className={`px-4 py-2 rounded-xl text-xs font-medium transition cursor-pointer ${filtroAtivo === 'todos' ? 'bg-violet-600 text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>Todos</button>
                <button onClick={() => setFiltroAtivo('desenhos')} className={`px-4 py-2 rounded-xl text-xs font-medium transition cursor-pointer ${filtroAtivo === 'desenhos' ? 'bg-violet-600 text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>Desenhos</button>
                <button onClick={() => setFiltroAtivo('mandalas')} className={`px-4 py-2 rounded-xl text-xs font-medium transition cursor-pointer ${filtroAtivo === 'mandalas' ? 'bg-violet-600 text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>Mandalas</button>
                <button onClick={() => setFiltroAtivo('mobiles')} className={`px-4 py-2 rounded-xl text-xs font-medium transition cursor-pointer ${filtroAtivo === 'mobiles' ? 'bg-violet-600 text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>Móbiles</button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {artesFiltradas.length === 0 ? (
                  <p className="text-sm text-gray-500 italic col-span-full py-10 text-center">Nenhuma arte encontrada nesta categoria.</p>
                ) : (
                  artesFiltradas.map((arte) => {
                    const jaCurtiu = userLikes.includes(arte.id);
                    const totalComentarios = (comentarios[arte.id] || []).length;
                    return (
                      <div key={arte.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 cursor-pointer group flex flex-col relative" onClick={() => setImagemSelecionada(arte)}>
                        <div className="overflow-hidden h-64 relative bg-gray-100">
                          {arte.vendido ? (
                            <span className="absolute top-3 left-3 bg-rose-500 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-sm uppercase tracking-wider z-10">Vendida</span>
                          ) : (
                            <span className="absolute top-3 left-3 bg-emerald-600 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-sm uppercase tracking-wider z-10">Disponível</span>
                          )}
                          <img className="w-full h-full object-cover group-hover:scale-105 transition duration-500" src={arte.src} alt={arte.alt} />
                          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-medium">🔍 Ver detalhes</div>
                        </div>

                        {/* CORREÇÃO DO TÍTULO E BOTÕES AQUI */}
                        <div className="p-4 bg-white flex flex-col gap-2">
                          <div className="flex items-start justify-between gap-3">
                            <span className="text-sm font-semibold text-gray-800 leading-snug flex-1">{arte.alt}</span>

                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-xs text-gray-400">💬 {totalComentarios}</span>
                              <button onClick={(e) => toggleCurtirArte(arte.id, e)} className={`flex items-center gap-1 px-3 py-1.5 rounded-full transition text-xs font-medium cursor-pointer active:scale-95 ${jaCurtiu ? 'bg-rose-50 text-rose-600 shadow-inner' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>
                                <span>{jaCurtiu ? '❤️' : '🤍'}</span>
                                <span>{likes[arte.id] || 0}</span>
                              </button>
                            </div>
                          </div>

                          {!arte.vendido && (
                            <span className="text-xs font-bold text-emerald-600">
                              {typeof arte.preco === 'number' ? `R$ ${arte.preco.toFixed(2)}` : arte.preco}
                            </span>
                          )}

                          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{arte.descricao}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </>
          ) : (
            <>
              <div className="max-w-xl mx-auto w-full mb-4 text-center sm:text-left">
                <h2 className="text-xl font-bold text-gray-800">📸 Bastidores & Produção</h2>
                <p className="text-xs text-gray-500">Acompanhe o dia a dia do atelier, rascunhos e momentos de criação.</p>
              </div>

              <div className="flex flex-col gap-6 max-w-xl mx-auto w-full">
                {postagensOrdenadas.map((post) => {
                  const jaCurtiu = userPostLikes.includes(post.id);
                  const totalComentarios = (postComentarios[post.id] || []).length;
                  const listaFotos = post.fotos || (post.src ? [post.src] : []);

                  return (
                    <div key={post.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex flex-col">
                      <div className="px-4 py-3 flex items-center justify-between border-b border-gray-50">
                        <div className="flex items-center gap-2.5">
                          <img src={Giovanni} alt="Giovanni" className="w-8 h-8 rounded-full object-cover shadow-sm" />
                          <div>
                            <span className="text-xs font-bold text-gray-800 block">Giovanni Vittorazze</span>
                            <span className="text-[10px] text-gray-400">Atelier de Arte</span>
                          </div>
                        </div>
                        <span className="text-[10px] bg-violet-50 text-violet-700 px-2.5 py-1 rounded-full font-medium">{post.data}</span>
                      </div>

                      <div
                        onClick={() => { setPostagemSelecionada(post); setIndiceFotoAtual(0); }}
                        className="w-full h-80 bg-gray-900 relative flex items-center justify-center cursor-pointer group overflow-hidden"
                      >
                        {post.tipo === 'vimeo' && post.capa ? (
                          <>
                            <img src={post.capa} alt="Capa do Vídeo" className="w-full h-full object-cover group-hover:scale-102 transition duration-500" />
                            <div className="absolute w-14 h-14 bg-black/60 rounded-full flex items-center justify-center text-white text-2xl pl-1 shadow-lg backdrop-blur-xs group-hover:scale-110 transition duration-300">▶</div>
                          </>
                        ) : post.tipo === 'vimeo' ? (
                          <iframe src={post.src} className="w-full h-full object-cover pointer-events-none" frameBorder="0"></iframe>
                        ) : post.tipo === 'video' ? (
                          <video src={post.src} className="w-full h-full object-cover pointer-events-none" muted />
                        ) : (
                          <>
                            <img src={listaFotos[0]} alt="Postagem" className="w-full h-full object-cover group-hover:scale-102 transition duration-500" />
                            {listaFotos.length > 1 && (
                              <span className="absolute top-3 right-3 bg-black/60 text-white text-[10px] px-2.5 py-1 rounded-full backdrop-blur-sm font-medium z-10">
                                📷 1 / {listaFotos.length}
                              </span>
                            )}
                          </>
                        )}
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-medium z-10">
                          {post.tipo === 'video' || post.tipo === 'vimeo' ? '▶️ Assistir vídeo completo' : '🔍 Ver galeria de fotos'}
                        </div>
                      </div>

                      <div className="p-4 bg-white flex flex-col gap-3">
                        <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">{post.legenda}</p>

                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                          <button
                            type="button"
                            onClick={() => { setPostagemSelecionada(post); setIndiceFotoAtual(0); }}
                            className="text-xs font-semibold text-violet-600 hover:text-violet-700 cursor-pointer flex items-center gap-1.5"
                          >
                            <span>💬</span> Comentários ({totalComentarios})
                          </button>

                          <button
                            type="button"
                            onClick={(e) => toggleCurtirPost(post.id, e)}
                            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full transition text-xs font-medium cursor-pointer active:scale-95 z-20 ${jaCurtiu ? 'bg-rose-50 text-rose-600 shadow-inner' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                          >
                            <span>{jaCurtiu ? '❤️' : '🤍'}</span>
                            <span>{postLikes[post.id] || 0}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </main>

        <Sidebar isAdmin={isAdmin} toggleAdmin={toggleAdmin} />
      </div>

      {/* MODAL DE DETALHES DA ARTE */}
      {imagemSelecionada && (() => {
        const jaCurtiuModal = userLikes.includes(imagemSelecionada.id);
        const listaComentarios = comentarios[imagemSelecionada.id] || [];

        return (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="relative max-w-2xl w-full max-h-[90vh] bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col">
              <button onClick={() => setImagemSelecionada(null)} className="absolute top-4 right-4 text-white text-xl font-bold bg-black/60 w-8 h-8 flex items-center justify-center rounded-full hover:bg-rose-600 transition cursor-pointer z-10">&times;</button>

              <div className="overflow-y-auto max-h-[90vh]">
                <div className="bg-black flex items-center justify-center max-h-[55vh] relative">
                  {imagemSelecionada.vendido ? (
                    <span className="absolute top-4 left-4 bg-rose-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md uppercase tracking-wider z-10">Vendida</span>
                  ) : (
                    <span className="absolute top-4 left-4 bg-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md uppercase tracking-wider z-10">Disponível</span>
                  )}
                  <img src={imagemSelecionada.src} alt={imagemSelecionada.alt} className="max-w-full max-h-[55vh] object-contain" />
                </div>

                <div className="p-6 bg-white flex flex-col gap-3 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-gray-800 text-base block">{imagemSelecionada.alt}</span>
                      {!imagemSelecionada.vendido && <span className="text-sm font-extrabold text-emerald-600">{typeof imagemSelecionada.preco === 'number' ? `R$ ${imagemSelecionada.preco.toFixed(2)}` : imagemSelecionada.preco}</span>}
                    </div>
                    <button onClick={() => toggleCurtirArte(imagemSelecionada.id)} className={`flex items-center gap-2 px-4 py-2 rounded-full transition font-bold cursor-pointer active:scale-95 ${jaCurtiuModal ? 'bg-rose-50 text-rose-600 shadow-inner' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>
                      <span className="text-base">{jaCurtiuModal ? '❤️' : '🤍'}</span>
                      <span className="text-xs">{likes[imagemSelecionada.id] || 0} Curtidas</span>
                    </button>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{imagemSelecionada.descricao}</p>
                  <button onClick={() => compartilharArte(imagemSelecionada)} className="self-start flex items-center gap-2 px-3.5 py-2 bg-violet-50 hover:bg-violet-100 text-violet-700 text-xs font-semibold rounded-xl transition cursor-pointer">
                    <span>📤</span> Compartilhar esta obra
                  </button>
                </div>

                <div className="p-6 bg-[#faf9f6] flex flex-col gap-4">
                  <h3 className="font-bold text-gray-800 text-sm">Comentários ({listaComentarios.length})</h3>
                  <div className="flex flex-col gap-2 max-h-40 overflow-y-auto pr-1">
                    {listaComentarios.length === 0 ? (
                      <p className="text-xs text-gray-400 italic">Nenhum comentário ainda. Seja o primeiro a comentar!</p>
                    ) : (
                      listaComentarios.map((c) => {
                        const podeDeletar = meusComentariosIds.includes(c.id) || isAdmin;
                        return (
                          <div key={c.id} className="bg-white p-3 rounded-xl border border-gray-200/60 text-xs flex flex-col gap-1 shadow-xs">
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-gray-900">{c.nome}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-gray-400">{c.data}</span>
                                {podeDeletar && (
                                  <button onClick={() => handleDeletarComentarioArte(imagemSelecionada.id, c.id)} className="text-rose-500 hover:text-rose-700 text-xs font-medium bg-rose-50 px-2 py-0.5 rounded cursor-pointer">🗑️ Apagar</button>
                                )}
                              </div>
                            </div>
                            <p className="text-gray-600">{c.texto}</p>
                          </div>
                        );
                      })
                    )}
                  </div>

                  <form onSubmit={(e) => handleAdicionarComentarioArte(imagemSelecionada.id, e)} className="flex flex-col gap-2.5 pt-3 border-t border-gray-200/60">
                    <span className="text-xs font-semibold text-gray-700">Deixe seu comentário:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input type="text" placeholder="Seu nome" value={novoNome} onChange={(e) => setNovoNome(e.target.value)} className="text-xs p-2.5 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-violet-500" required />
                      <input type="email" placeholder="Seu e-mail (não publicado)" value={novoEmail} onChange={(e) => setNovoEmail(e.target.value)} className="text-xs p-2.5 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-violet-500" required />
                    </div>
                    <textarea placeholder="Escreva sua mensagem com carinho..." value={novoTexto} onChange={(e) => setNovoTexto(e.target.value)} rows={2} className="text-xs p-2.5 rounded-xl border border-gray-300 bg-white resize-none focus:outline-none focus:ring-2 focus:ring-violet-500" required></textarea>
                    <button type="submit" className="bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold py-2.5 px-5 rounded-xl transition self-end cursor-pointer shadow-sm">Enviar Comentário</button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* MODAL DE DETALHES DA POSTAGEM */}
      {postagemSelecionada && (() => {
        const jaCurtiuModal = userPostLikes.includes(postagemSelecionada.id);
        const listaComentarios = postComentarios[postagemSelecionada.id] || [];
        const listaFotosModal = postagemSelecionada.fotos || (postagemSelecionada.src ? [postagemSelecionada.src] : []);

        return (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="relative max-w-2xl w-full max-h-[90vh] bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col">
              <button
                type="button"
                onClick={() => setPostagemSelecionada(null)}
                className="absolute top-4 right-4 text-white text-xl font-bold bg-black/60 w-8 h-8 flex items-center justify-center rounded-full hover:bg-rose-600 transition cursor-pointer z-50"
              >
                &times;
              </button>

              <div className="overflow-y-auto max-h-[90vh]">
                <div className="bg-black flex items-center justify-center max-h-[55vh] relative min-h-[300px]">
                  {postagemSelecionada.tipo === 'video' ? (
                    <video src={postagemSelecionada.src} controls autoPlay className="max-w-full max-h-[55vh] object-contain" />
                  ) : postagemSelecionada.tipo === 'vimeo' ? (
                    <iframe src={`${postagemSelecionada.src}?autoplay=1`} className="w-full h-[55vh]" frameBorder="0" allow="autoplay; fullscreen; picture-in-picture" allowFullScreen></iframe>
                  ) : (
                    <>
                      <img src={listaFotosModal[indiceFotoAtual]} alt="Postagem" className="max-w-full max-h-[55vh] object-contain transition-all" />

                      {listaFotosModal.length > 1 && (
                        <>
                          {indiceFotoAtual > 0 && (
                            <button
                              onClick={(e) => { e.stopPropagation(); setIndiceFotoAtual(prev => prev - 1); }}
                              className="absolute left-3 bg-black/50 hover:bg-black/80 text-white w-9 h-9 rounded-full flex items-center justify-center text-lg transition cursor-pointer"
                            >
                              ‹
                            </button>
                          )}
                          {indiceFotoAtual < listaFotosModal.length - 1 && (
                            <button
                              onClick={(e) => { e.stopPropagation(); setIndiceFotoAtual(prev => prev + 1); }}
                              className="absolute right-3 bg-black/50 hover:bg-black/80 text-white w-9 h-9 rounded-full flex items-center justify-center text-lg transition cursor-pointer"
                            >
                              ›
                            </button>
                          )}
                          <span className="absolute bottom-3 bg-black/60 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm">
                            {indiceFotoAtual + 1} / {listaFotosModal.length}
                          </span>
                        </>
                      )}
                    </>
                  )}
                </div>

                <div className="p-6 bg-white flex flex-col gap-3 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400 font-medium">Publicado em {postagemSelecionada.data}</span>
                    <button onClick={() => toggleCurtirPost(postagemSelecionada.id)} className={`flex items-center gap-2 px-4 py-2 rounded-full transition font-bold cursor-pointer active:scale-95 ${jaCurtiuModal ? 'bg-rose-50 text-rose-600 shadow-inner' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>
                      <span className="text-base">{jaCurtiuModal ? '❤️' : '🤍'}</span>
                      <span className="text-xs">{postLikes[postagemSelecionada.id] || 0} Curtidas</span>
                    </button>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">{postagemSelecionada.legenda}</p>
                </div>

                <div className="p-6 bg-[#faf9f6] flex flex-col gap-4">
                  <h3 className="font-bold text-gray-800 text-sm">Comentários ({listaComentarios.length})</h3>
                  <div className="flex flex-col gap-2 max-h-40 overflow-y-auto pr-1">
                    {listaComentarios.length === 0 ? (
                      <p className="text-xs text-gray-400 italic">Nenhum comentário ainda. Seja o primeiro a comentar!</p>
                    ) : (
                      listaComentarios.map((c) => {
                        const podeDeletar = meusPostComentariosIds.includes(c.id) || isAdmin;
                        return (
                          <div key={c.id} className="bg-white p-3 rounded-xl border border-gray-200/60 text-xs flex flex-col gap-1 shadow-xs">
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-gray-900">{c.nome}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-gray-400">{c.data}</span>
                                {podeDeletar && (
                                  <button onClick={() => handleDeletarComentarioPost(postagemSelecionada.id, c.id)} className="text-rose-500 hover:text-rose-700 text-xs font-medium bg-rose-50 px-2 py-0.5 rounded cursor-pointer">🗑️ Apagar</button>
                                )}
                              </div>
                            </div>
                            <p className="text-gray-600">{c.texto}</p>
                          </div>
                        );
                      })
                    )}
                  </div>

                  <form onSubmit={(e) => handleAdicionarComentarioPost(postagemSelecionada.id, e)} className="flex flex-col gap-2.5 pt-3 border-t border-gray-200/60">
                    <span className="text-xs font-semibold text-gray-700">Deixe seu comentário:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input type="text" placeholder="Seu nome" value={novoNome} onChange={(e) => setNovoNome(e.target.value)} className="text-xs p-2.5 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-violet-500" required />
                      <input type="email" placeholder="Seu e-mail (não publicado)" value={novoEmail} onChange={(e) => setNovoEmail(e.target.value)} className="text-xs p-2.5 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-violet-500" required />
                    </div>
                    <textarea placeholder="Escreva sua mensagem com carinho..." value={novoTexto} onChange={(e) => setNovoTexto(e.target.value)} rows={2} className="text-xs p-2.5 rounded-xl border border-gray-300 bg-white resize-none focus:outline-none focus:ring-2 focus:ring-violet-500" required></textarea>
                    <button type="submit" className="bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold py-2.5 px-5 rounded-xl transition self-end cursor-pointer shadow-sm">Enviar Comentário</button>
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

export default App;