import { useState, useEffect } from 'react'
import './App.css'
import { supabase } from './supabaseClient'

import Giovanni from "./assets/img/foto.jpg"

import Cavalo from "./assets/img/cavalo.JPEG"
import Canario from "./assets/img/canarinho.JPEG"
import Aguia from "./assets/img/aguia.JPEG"
import Ganesha from "./assets/img/ganesha.JPEG"
import NSAparecida from "./assets/img/nsaparecida.JPEG"
import Iemanja from "./assets/img/iemanja.JPEG"
import MariaMadalena from "./assets/img/mariamadalena.JPEG"
import Oxum from "./assets/img/oxum.JPEG"
import TrancaRuas from "./assets/img/trancaruas.JPEG"
import MobiFraternidadeBranca from "./assets/img/mobifraternidadebranca.jpg"
import MobiOrixas from "./assets/img/mobiorixas.jpg"

import Goku01 from "./assets/img/goku01.JPEG"
import Goku02 from "./assets/img/goku02.JPEG"
import Goku03 from "./assets/img/goku03.JPEG"
import Goku04 from "./assets/img/goku04.jpg"

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
  preco: number;
  vendido: boolean;
}

interface Postagem {
  id: string;
  tipo: 'foto' | 'video' | 'vimeo';
  fotos?: string[];
  src?: string;
  capa?: string; // Capa/Thumbnail personalizada para vídeos!
  legenda: string;
  data: string;
}

const galeriaArtes: Arte[] = [
  {
    id: 'cavalo',
    src: Cavalo,
    alt: 'Cavalo A4',
    descricao: 'É um símbolo de liberdade, força e poder. É visto como o ser que habita a fronteira entre o físico e o invisível. É associado a forças instintivas da psique, representando a energia bruta que pode ser guiada, mas nunca domada.',
    preco: 250.00,
    vendido: false
  },
  {
    id: 'canario',
    src: Canario,
    alt: 'Canarinho A4',
    descricao: 'O Canarinho é um símbolo de alegria, liberdade e harmonia. Representa criatividade, expressão artística e comunicação, tráz boa sorte e felicidade. Busque a expressão autêntica e harmoniosa do ser!',
    preco: 250.00,
    vendido: false
  },
  {
    id: 'aguia',
    src: Aguia,
    alt: 'Águia A3',
    descricao: 'A Águia é um símbolo de força e soberania, arquétipo de coragem, domínio e poder interior. Liberdade e propósito elevado, representa a alma que busca alturas maiores e vive guiada por um propósito elevado. Visão espiritual e clareza, simboliza a capacidade de enxergar além do óbvio, trazendo discernment e orientação.',
    preco: 400.00,
    vendido: false
  },
  {
    id: 'ganesha',
    src: Ganesha,
    alt: 'Ganesha A3',
    descricao: 'Ganesha é um deus Hindú, da sabedoria, do início e do fim. É venerado como o eliminador de obstáculos e o trazedor de sucesso. Representa a sabedoria e a inteligência, simbolizando o conhecimento que transcende o mundo físico.',
    preco: 650.00,
    vendido: true
  },
  {
    id: 'nsaparecida',
    src: NSAparecida,
    alt: 'Mandala - Nossa Senhora Aparecida 80x80cm',
    descricao: 'A Padroeira do nosso Brasil, intercede por todos os que a invocam por fé. Parte da identidade brasileira, representa a humildade, reconstrução interior, símbolo de esperança, "nas águas turvas do caminho, Deus sempre coloca um sinal de esperança para aqueles que tem olhos de fé para enxergar".',
    preco: 900.00,
    vendido: false
  },
  {
    id: 'iemanja',
    src: Iemanja,
    alt: 'Mandala - Iemanjá 60x60cm',
    descricao: 'Iemanjá é a divindade do rio que deságua no mar, a rainha dos oceanos e mãe de todos os Orixás. Representa o poder progenitor feminino, é a que nos faz nascer, divindade que é maternidade universal, a mãe do Mundo. A protetora dos Marinheiros, da maternidade e fertilidade.',
    preco: 650.00,
    vendido: false
  },
  {
    id: 'mariamadalena',
    src: MariaMadalena,
    alt: 'Mandala - Maria Madalena 60x60cm',
    descricao: 'É a figura central na devoção cristã, especialmente entre as mulheres. É venerada como uma das seguidoras mais fiéis de Cristo. A devoção a Maria Madalena envolve orações e preces que buscam sua intercessão para arrependimento, perdão e renovação. Padroeira dos pecadores, arrependidos, as mulheres e as pessoas que enfrentam dificuldades em sua vida.',
    preco: 650.00,
    vendido: false
  },
  {
    id: 'oxum',
    src: Oxum,
    alt: 'Mandala - Oxum 60x60cm',
    descricao: '(Pequeno detalhe na parte inferior esquerda) Rainha das águas doces, dona dos rios e cachoeiras, considerada a senhora da beleza, da fertilidade, do amor, do dinheiro, da sensibilidade. Associada a riqueza espiritual e material.',
    preco: 650.00,
    vendido: false
  },
  {
    id: 'trancaruas',
    src: TrancaRuas,
    alt: 'Mandala - Exú Tranca Ruas 55x55cm',
    descricao: 'Guardião dos caminhos, protetor espiritual e mensageiro dos Orixás, ele abre ou fecha as portas na vida dos devotos, de acordo com o merecimento da pessoa. Quem está em sintonia com a verdade e busca crescimento pode contar com sua ajuda para superar obstáculos.',
    preco: 550.00,
    vendido: false
  },
  {
    id: 'mobifraternidadebranca',
    src: MobiFraternidadeBranca,
    alt: 'Mobile - 7 Raios Cósmicos, a Fraternidade Branca & os 7 Chakras 120x9cm',
    descricao: 'Os 7 Raios Cósmicos, são as principais forças de energia espiritual que influenciam a vida na Terra, sendo transmitidos pelo Sol e outros astros. A Fraternidade Branca é uma irmandade espiritual que busca a evolução da humanidade, promovendo a paz, a harmonia e o desenvolvimento espiritual. Os Chakras são centros de energia no corpo humano, cada um associado a diferentes aspectos físicos, emocionais e espirituais. Na frente temos a representação dos 7 Raios cósmicos, eles são uma divisão das virtudes divinas para este plano. Cada um deles estão representados por um Mestre Ascencionado da Fraternidade Branca que são: Mestre Ascencionado Serapis Bey (4º Raio Branco - Pureza e Ascenção), Mestre Ascencionado Saint Germain (7º Raio Violeta - a Era da Liberdade, Transmutação e Purificação), Mestra Ascencionada Nada (6º Raio Rubi Dourado - Paz, Amor e Devoção), Mestra Ascencionada Rowena (3º Raio Rosa - Amor Divino, Delicadeza e Compreensão), Mestre Ascencionado El Morya (1º Raio Azul - Poder Divino e a Fé), Mestre Ascencionado Hilarion (5º Raio Verde - Verdade, Inteligência e Cura), Mestre Ascencionado Kuthumi (2º Raio Amarelo Dourado - Sabedoria e Compreensão). No verso temos os 7 Chakras principais, que são: Chakra Raiz (Muladhara), Chakra Sacral (Svadhisthana), Chakra do Plexo Solar (Manipura), Chakra do Coração (Anahata), Chakra da Garganta (Vishuddha), Chakra da Coroa (Sahasrara). Cada um desses chakras está associado a diferentes aspectos da vida e da consciência, e o equilíbrio entre eles é essencial para o bem-estar físico, emocional e espiritual. ',
    preco: 650.00,
    vendido: true
  },
  {
    id: 'mobiorixas',
    src: MobiOrixas,
    alt: 'Mobile - Orixás & Elementos 80x10cm',
    descricao: 'Mobile artístico dos Orixás & Elementos, onde cada um representa um elemento da natureza, Terra: Oxóssi, Fogo: Xangô, Água: Iemanjá, Ar: Iansã, ideal para decoração espiritual e harmonia do ambiente. Terra é o elemento que nos conecta com a realidade, Fogo é o elemento da transformação e ação, Água é o elemento da intuição e emoções, Ar é o elemento da comunicação e intelecto. Oxóssi é o Orixá da caça, da fartura e da prosperidade, Xangô é o Orixá da justiça, do equilíbrio e da força, Iemanjá é a Orixá das águas, da maternidade e da proteção, Iansã é a Orixá dos ventos, das tempestades e da coragem.',
    preco: 500.00,
    vendido: false
  },
];

// VEJA ABAIXO COMO USAR O CAMPO 'capa':
const galeriaPostagens: Postagem[] = [
  {
    id: 'post-1',
    tipo: 'vimeo',
    src: 'https://player.vimeo.com/video/1239287524',
    capa: Goku04, // Informe aqui qualquer imagem importada para ser a thumbnail do vídeo!
    legenda: 'Andamento do projeto Goku SSJ 3, confere aí como está ficando. Comecei a trabalhar o fundo, está ficando show! ✨',
    data: '25/10/2026'
  },
  {
    id: 'post-2',
    tipo: 'foto',
    fotos: [Goku01, Goku02, Goku03],
    legenda: 'Bastidores do atelier: Comecei este novo desenho em folha A3, do personagem Goku na transformação de Super Saiyajin 3 do anime Dragon Ball Z, os traços e sombreamento de desenhos de animes são muito diferentes, geralmente os contornos são bem definidos e o sombreamente não é totalmente nivelado, é um novo desafio! Estou juntando a técnica nova com a de arte realista, já comecei o sombreamento, dê uma olhada. Deslize para ver mais! ✏️🎨',
    data: '19/10/2026'
  },
];

const SENHA_ADMIN = "19932403";

function App() {
  const [paginaAtual, setPaginaAtual] = useState<'galeria' | 'postagens'>('galeria');
  const [menuAberto, setMenuAberto] = useState(false);

  const [imagemSelecionada, setImagemSelecionada] = useState<Arte | null>(null);
  const [postagemSelecionada, setPostagemSelecionada] = useState<Postagem | null>(null);
  const [indiceFotoAtual, setIndiceFotoAtual] = useState<number>(0);
  const [filtroAtivo, setFiltroAtivo] = useState<'todos' | 'mandalas' | 'desenhos'>('todos');

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
    const textoCompartilhamento = `🎨 Confira a obra "${arte.alt}" de Giovanni Vittorazze por R$ ${arte.preco.toFixed(2)}!\n\n"${arte.descricao}"\n\nVeja os detalhes e deixe seu comentário aqui: ${linkEspecifico}`;

    if (navigator.share) {
      navigator.share({ title: arte.alt, text: textoCompartilhamento, url: linkEspecifico }).catch(() => { });
    } else {
      navigator.clipboard.writeText(textoCompartilhamento);
      alert('Link direto copiado para a área de transferência!');
    }
  };

  const artesFiltradas = galeriaArtes.filter((arte) => {
    const ehMandala = arte.alt.toLowerCase().includes('mandala');
    if (filtroAtivo === 'mandalas') return ehMandala;
    if (filtroAtivo === 'desenhos') return !ehMandala;
    return true;
  });

  const postagensOrdenadas = [...galeriaPostagens].sort((a, b) => {
    const [diaA, mesA, anoA] = a.data.split('/').map(Number);
    const [diaB, mesB, anoB] = b.data.split('/').map(Number);
    return new Date(anoB, mesB - 1, diaB).getTime() - new Date(anoA, mesA - 1, diaA).getTime();
  });

  return (
    <div className="min-h-screen bg-[#faf9f6]">
      <header className="fixed top-0 left-0 w-full h-20 bg-gradient-to-r from-violet-600 via-purple-600 to-cyan-600 flex items-center justify-between px-6 sm:px-10 shadow-md z-40 text-white">
        <span className="font-['amoresa'] text-2xl sm:text-3xl tracking-wide">Giovanni Vittorazze</span>

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

      <div className="flex flex-col lg:flex-row pt-20 min-h-screen">
        <main className="flex-1 p-4 sm:p-8 flex flex-col gap-6 lg:mr-80">

          {paginaAtual === 'galeria' ? (
            <>
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                <span className="text-xs font-semibold text-gray-500 mr-1 uppercase tracking-wider">Filtrar:</span>
                <button onClick={() => setFiltroAtivo('todos')} className={`px-4 py-2 rounded-xl text-xs font-medium transition cursor-pointer ${filtroAtivo === 'todos' ? 'bg-violet-600 text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>Todos</button>
                <button onClick={() => setFiltroAtivo('mandalas')} className={`px-4 py-2 rounded-xl text-xs font-medium transition cursor-pointer ${filtroAtivo === 'mandalas' ? 'bg-violet-600 text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>Mandalas</button>
                <button onClick={() => setFiltroAtivo('desenhos')} className={`px-4 py-2 rounded-xl text-xs font-medium transition cursor-pointer ${filtroAtivo === 'desenhos' ? 'bg-violet-600 text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>Desenhos</button>
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
                        <div className="p-4 bg-white flex items-center justify-between">
                          <div>
                            <span className="text-sm font-semibold block text-gray-800">{arte.alt}</span>
                            {!arte.vendido && <span className="text-xs font-bold text-emerald-600">R$ {arte.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400">💬 {totalComentarios}</span>
                            <button onClick={(e) => toggleCurtirArte(arte.id, e)} className={`flex items-center gap-1 px-3 py-1.5 rounded-full transition text-xs font-medium cursor-pointer active:scale-95 ${jaCurtiu ? 'bg-rose-50 text-rose-600 shadow-inner' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>
                              <span>{jaCurtiu ? '❤️' : '🤍'}</span>
                              <span>{likes[arte.id] || 0}</span>
                            </button>
                          </div>
                        </div>
                        <div className="px-4 pb-4 bg-white"><p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{arte.descricao}</p></div>
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

                      {/* EXIBIÇÃO DE VÍDEOS E THUMBNAIL NO FEED */}
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
            <p>A arte é considerada a expressão mais pura do espírito. O contato com a arte pode despertar sentimentos e emoções profundas, trazendo consciência e sabedoria!</p>
            <p>Deixo aqui meu portfólio para apreciação, mas também faço sob encomendas, chama no WhatsApp para mais informações.</p>
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
                      {!imagemSelecionada.vendido && <span className="text-sm font-extrabold text-emerald-600">R$ {imagemSelecionada.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>}
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