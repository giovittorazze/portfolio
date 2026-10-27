import { useState, useEffect } from 'react'
import './App.css'
import { supabase } from './supabaseClient'
import type { Comentario, Arte, Postagem } from './types'
import { galeriaArtes } from './data/artes'
import { galeriaPostagens } from './data/postagens'
import { Header } from './components/Header'
import { Sidebar } from './components/Sidebar'
import { AuthModal } from './components/AuthModal'
import { CarrinhoModal } from './components/CarrinhoModal'
import { MeusPedidosModal } from './components/MeusPedidosModal'
import { AdminPedidosModal } from './components/AdminPedidosModal'
import type { User } from '@supabase/supabase-js'

import Giovanni from "./assets/img/foto.jpg"
import { initMercadoPago } from '@mercadopago/sdk-react';

// Inicialização do Mercado Pago
initMercadoPago('APP_USR-38cd9e74-5da5-4cf1-aa1d-5ff7f3adf7d1', { locale: 'pt-BR' });

const SENHA_ADMIN = "19932403";

interface OpcaoFrete {
  id: string;
  nome: string;
  valor: number;
  prazo: string;
}

interface Pedido {
  id: string;
  created_at: string;
  user_id: string;
  itens: Arte[];
  valor_total: number;
  valor_frete?: number;
  tipo_frete?: string;
  cep_entrega?: string;
  status: string;
  codigo_rastreio?: string;
}

function App() {
  const [paginaAtual, setPaginaAtual] = useState<'galeria' | 'postagens'>('galeria');
  const [menuAberto, setMenuAberto] = useState(false);

  // Estados de Autenticação na App
  const [usuario, setUsuario] = useState<User | null>(null);
  const [modalAuthAberto, setModalAuthAberto] = useState(false);
  const [modoModal, setModoModal] = useState<'login' | 'cadastro'>('login');

  const [imagemSelecionada, setImagemSelecionada] = useState<Arte | null>(null);
  const [postagemSelecionada, setPostagemSelecionada] = useState<Postagem | null>(null);
  const [indiceFotoAtual, setIndiceFotoAtual] = useState<number>(0);

  const [filtroAtivo, setFiltroAtivo] = useState<'todos' | 'mandalas' | 'desenhos' | 'mobiles'>('todos');

  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return localStorage.getItem('giovanni_is_admin') === 'true';
  });

  const [likes, setLikes] = useState<{ [key: string]: number }>({});
  const [userLikes, setUserLikes] = useState<string[]>([]);
  const [comentarios, setComentarios] = useState<{ [key: string]: Comentario[] }>({});
  const [meusComentariosIds, setMeusComentariosIds] = useState<(string | number)[]>(() => {
    const salvos = localStorage.getItem('giovanni_meus_comentarios_ids');
    return salvos ? JSON.parse(salvos) : [];
  });

  const [postLikes, setPostLikes] = useState<{ [key: string]: number }>({});
  const [userPostLikes, setUserPostLikes] = useState<string[]>([]);
  const [postComentarios, setPostComentarios] = useState<{ [key: string]: Comentario[] }>({});
  const [meusPostComentariosIds, setMeusPostComentariosIds] = useState<(string | number)[]>(() => {
    const salvos = localStorage.getItem('giovanni_meus_posts_comentarios_ids');
    return salvos ? JSON.parse(salvos) : [];
  });

  const [novoTexto, setNovoTexto] = useState('');

  // Estado para armazenar IDs de obras vendidas com base nos pedidos aprovados
  const [artesVendidasIds, setArtesVendidasIds] = useState<string[]>([]);

  // Estados do Carrinho
  const [carrinho, setCarrinho] = useState<Arte[]>(() => {
    const salvos = localStorage.getItem('giovanni_carrinho');
    return salvos ? JSON.parse(salvos) : [];
  });

  const [carrinhoAberto, setCarrinhoAberto] = useState(false);
  const [etapaPagamento, setEtapaPagamento] = useState(false);

  // Estados de Frete
  const [cep, setCep] = useState('');
  const [calculandoFrete, setCalculandoFrete] = useState(false);
  const [opcoesFrete, setOpcoesFrete] = useState<OpcaoFrete[]>([]);
  const [freteSelecionado, setFreteSelecionado] = useState<OpcaoFrete | null>(null);
  const [infoCidade, setInfoCidade] = useState<string>('');
  const [endereco, setEndereco] = useState<{
    logradouro: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidadeUF: string;
    cep: string;
  }>({
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidadeUF: '',
    cep: ''
  });

  // Estado para armazenar o Pix gerado
  const [dadosPix, setDadosPix] = useState<{
    qr_code?: string;
    qr_code_base64?: string;
    ticket_url?: string;
  } | null>(null);

  // Estados dos Pedidos e Painel do Cliente e Admin
  const [meusPedidos, setMeusPedidos] = useState<Pedido[]>([]);
  const [modalPedidosAberto, setModalPedidosAberto] = useState(false);
  const [modalAdminPedidosAberto, setModalAdminPedidosAberto] = useState(false);
  const [todosPedidos, setTodosPedidos] = useState<Pedido[]>([]);
  const [carregandoPedidos, setCarregandoPedidos] = useState(false);

  // Estado para edição do admin
  const [editandoPedidoId, setEditandoPedidoId] = useState<string | null>(null);
  const [novoStatus, setNovoStatus] = useState<string>('');
  const [novoRastreio, setNovoRastreio] = useState<string>('');

  // Salva carrinho no localStorage
  useEffect(() => {
    localStorage.setItem('giovanni_carrinho', JSON.stringify(carrinho));
  }, [carrinho]);

  const adicionarAoCarrinho = (arte: Arte) => {
    const estaVendida = arte.vendido || artesVendidasIds.includes(arte.id);
    if (estaVendida) {
      alert('Esta obra já foi vendida!');
      return;
    }

    if (carrinho.some(item => item.id === arte.id)) {
      alert('Esta obra já está na sua sacola!');
      return;
    }

    setCarrinho([...carrinho, arte]);
    alert(`"${arte.alt}" foi adicionada à sua sacola! 🛍️`);
  };

  const removerDoCarrinho = (id: string) => {
    const novoCarrinho = carrinho.filter(item => item.id !== id);
    setCarrinho(novoCarrinho);
    if (novoCarrinho.length === 0) {
      setOpcoesFrete([]);
      setFreteSelecionado(null);
      setInfoCidade('');
    }
  };

  const subtotalCarrinho = carrinho.reduce((total, item) => {
    const precoNum = typeof item.preco === 'number' ? item.preco : 0;
    return total + precoNum;
  }, 0);

  const valorFrete = freteSelecionado ? freteSelecionado.valor : 0;
  const valorTotalGeral = subtotalCarrinho + valorFrete;

  const calcularFreteCorreios = async () => {
    const cepLimpo = cep.replace(/\D/g, '');
    if (cepLimpo.length !== 8) {
      alert('Por favor, digite um CEP válido com 8 dígitos.');
      return;
    }

    setCalculandoFrete(true);
    setOpcoesFrete([]);
    setFreteSelecionado(null);

    try {
      const resCep = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const dadosCep = await resCep.json();

      if (dadosCep.erro) {
        alert('CEP não encontrado. Verifique o número digitado.');
        setCalculandoFrete(false);
        return;
      }

      const cidadeUfFormatada = `${dadosCep.localidade} / ${dadosCep.uf}`;
      setInfoCidade(cidadeUfFormatada);

      setEndereco(prev => ({
        ...prev,
        logradouro: dadosCep.logradouro || prev.logradouro,
        bairro: dadosCep.bairro || prev.bairro,
        cidadeUF: cidadeUfFormatada,
        cep: cepLimpo
      }));

      const { data: dadosFreteEdge, error: erroEdge } = await supabase.functions.invoke('calcular-frete', {
        body: { cepDestino: cepLimpo, itens: carrinho }
      });

      if (!erroEdge && dadosFreteEdge && dadosFreteEdge.opcoes) {
        setOpcoesFrete(dadosFreteEdge.opcoes);
        setFreteSelecionado(dadosFreteEdge.opcoes[0]);
      } else {
        const ehSudeste = ['SP', 'RJ', 'MG', 'ES'].includes(dadosCep.uf);
        const ehSulCentroOeste = ['PR', 'SC', 'RS', 'GO', 'DF', 'MS', 'MT'].includes(dadosCep.uf);

        let precoPac = ehSudeste ? 24.90 : ehSulCentroOeste ? 36.50 : 49.90;
        let precoSedex = ehSudeste ? 34.90 : ehSulCentroOeste ? 58.00 : 79.90;

        if (carrinho.length > 1) {
          const adicional = (carrinho.length - 1) * 8.50;
          precoPac += adicional;
          precoSedex += adicional * 1.3;
        }

        const opcoesCalculadas = [
          { id: 'pac', nome: 'Correios PAC', valor: precoPac, prazo: ehSudeste ? '4 a 6 dias úteis' : '7 a 12 dias úteis' },
          { id: 'sedex', nome: 'Correios SEDEX', valor: precoSedex, prazo: ehSudeste ? '1 a 2 dias úteis' : '3 a 5 dias úteis' }
        ];

        setOpcoesFrete(opcoesCalculadas);
        setFreteSelecionado(opcoesCalculadas[0]);
      }
    } catch (err) {
      console.error('Erro ao calcular frete:', err);
      alert('Erro ao consultar o frete. Tente novamente.');
    } finally {
      setCalculandoFrete(false);
    }
  };

  const initialization = {
    amount: valorTotalGeral,
  };

  const customization = {
    paymentMethods: {
      creditCard: 'all',
      bankTransfer: 'all',
    },
  };

  const onSubmitMercadoPago = async ({ formData }: { formData: any }) => {
    if (!usuario) {
      alert('Você precisa estar logado para finalizar o pagamento!');
      setModoModal('cadastro');
      setModalAuthAberto(true);
      return;
    }

    if (!freteSelecionado) {
      alert('Por favor, calcule e selecione uma opção de frete antes de pagar.');
      setEtapaPagamento(false);
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('processar-pagamento', {
        body: {
          formData,
          carrinho,
          userId: usuario.id,
          valor_total: valorTotalGeral,
          valor_frete: valorFrete,
          opcao_frete: freteSelecionado.nome,
          cep_entrega: cep
        }
      });

      if (error) throw error;

      if (data && data.sucesso) {
        if (data.status === 'approved') {
          alert('Pagamento aprovado com sucesso! 🎨💳 Obrigado pela compra.');
          await registrarPedidoNoBanco('Aprovado');
          setCarrinho([]);
          localStorage.removeItem('giovanni_carrinho');
          setOpcoesFrete([]);
          setFreteSelecionado(null);
          setCep('');
          setInfoCidade('');
          setEtapaPagamento(false);
          setCarrinhoAberto(false);
          carregarDadosDoBanco();
        } else {
          setDadosPix({
            qr_code: data.qr_code,
            qr_code_base64: data.qr_code_base64,
            ticket_url: data.ticket_url
          });
          await registrarPedidoNoBanco('Aguardando Pix');
          carregarDadosDoBanco();
        }
      } else {
        alert('Pagamento recusado: ' + (data?.erro || 'Verifique os dados informados.'));
      }
    } catch (err: any) {
      alert('Erro ao processar pagamento: ' + err.message);
    }
  };

  const registrarPedidoNoBanco = async (statusPedido: string) => {
    await supabase.from('pedidos').insert([
      {
        user_id: usuario?.id,
        itens: carrinho,
        valor_total: valorTotalGeral,
        valor_frete: valorFrete,
        tipo_frete: freteSelecionado?.nome,
        cep_entrega: cep,
        endereco_completo: endereco, // <--- NOVA COLUNA
        status: statusPedido
      }
    ]);
  };

  // Carregar Meus Pedidos (Cliente)
  const carregarMeusPedidos = async () => {
    if (!usuario) {
      alert('Faça login para ver seus pedidos.');
      setModoModal('login');
      setModalAuthAberto(true);
      return;
    }

    setCarregandoPedidos(true);
    setModalPedidosAberto(true);

    try {
      const { data, error } = await supabase
        .from('pedidos')
        .select('*')
        .eq('user_id', usuario.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMeusPedidos(data || []);
    } catch (err: any) {
      console.error('Erro ao buscar pedidos:', err.message);
    } finally {
      setCarregandoPedidos(false);
    }
  };

  const apagarMeuPedido = async (pedidoId: string) => {
    if (!window.confirm('Tem certeza que deseja cancelar e apagar este pedido?')) return;

    try {
      const { error } = await supabase
        .from('pedidos')
        .delete()
        .eq('id', pedidoId)
        .eq('user_id', usuario?.id);

      if (error) throw error;

      alert('Pedido cancelado com sucesso.');
      carregarMeusPedidos();
      carregarDadosDoBanco();
    } catch (err: any) {
      alert('Erro ao apagar pedido: ' + err.message);
    }
  };

  const retomarPagamentoPedido = (pedido: Pedido) => {
    setCarrinho(pedido.itens || []);
    setModalPedidosAberto(false);
    setEtapaPagamento(true);
    setCarrinhoAberto(true);
  };

  // Carregar Todos os Pedidos (Admin)
  const carregarTodosPedidosAdmin = async () => {
    if (!isAdmin) return;

    setCarregandoPedidos(true);
    setModalAdminPedidosAberto(true);

    try {
      const { data, error } = await supabase
        .from('pedidos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTodosPedidos(data || []);
    } catch (err: any) {
      console.error('Erro ao buscar todos os pedidos:', err.message);
    } finally {
      setCarregandoPedidos(false);
    }
  };

  const salvarAlteracaoPedidoAdmin = async (pedidoId: string) => {
    try {
      const { error } = await supabase
        .from('pedidos')
        .update({
          status: novoStatus,
          codigo_rastreio: novoRastreio
        })
        .eq('id', pedidoId);

      if (error) throw error;

      alert('Pedido atualizado com sucesso! 📦');
      setEditandoPedidoId(null);
      carregarTodosPedidosAdmin();
      carregarDadosDoBanco();
    } catch (err: any) {
      alert('Erro ao atualizar pedido: ' + err.message);
    }
  };

  // Controlar Sessão do Utilizador
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUsuario(user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUsuario(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Carregar Dados do Supabase
  const carregarDadosDoBanco = async () => {
    try {
      const { data: pedidosData } = await supabase.from('pedidos').select('itens, status');
      if (pedidosData) {
        const idsVendidos: string[] = [];
        pedidosData.forEach((ped: any) => {
          if (['Aprovado', 'Enviado', 'Concluído'].includes(ped.status)) {
            if (Array.isArray(ped.itens)) {
              ped.itens.forEach((item: any) => {
                if (item && item.id) idsVendidos.push(item.id);
              });
            }
          }
        });
        setArtesVendidasIds(idsVendidos);
      }

      const { data: likesData } = await supabase.from('artes_likes').select('*');
      if (likesData) {
        const likesObj: { [key: string]: number } = {};
        const minhasCurtidas: string[] = [];

        likesData.forEach((item: any) => {
          likesObj[item.arte_id] = (likesObj[item.arte_id] || 0) + 1;
          if (usuario && item.user_id === usuario.id) {
            minhasCurtidas.push(item.arte_id);
          }
        });
        setLikes(likesObj);
        setUserLikes(minhasCurtidas);
      }

      const { data: comentsData } = await supabase
        .from('artes_comentarios')
        .select('*, profiles(nome, avatar_url)');
      if (comentsData) {
        const comentsObj: { [key: string]: Comentario[] } = {};
        comentsData.forEach((c: any) => {
          if (!comentsObj[c.arte_id]) comentsObj[c.arte_id] = [];
          comentsObj[c.arte_id].push({
            id: c.id,
            arte_id: c.arte_id,
            nome: c.profiles?.nome || 'Utilizador',
            email: '',
            texto: c.texto,
            data: new Date(c.created_at).toLocaleDateString('pt-BR')
          });
        });
        setComentarios(comentsObj);
      }

      const { data: pLikesData } = await supabase.from('postagens_likes').select('*');
      if (pLikesData) {
        const pLikesObj: { [key: string]: number } = {};
        const minhasPostCurtidas: string[] = [];

        pLikesData.forEach((item: any) => {
          pLikesObj[item.post_id] = (pLikesObj[item.post_id] || 0) + 1;
          if (usuario && item.user_id === usuario.id) {
            minhasPostCurtidas.push(item.post_id);
          }
        });
        setPostLikes(pLikesObj);
        setUserPostLikes(minhasPostCurtidas);
      }

      const { data: pComentsData } = await supabase
        .from('postagens_comentarios')
        .select('*, profiles(nome, avatar_url)');
      if (pComentsData) {
        const pComentsObj: { [key: string]: Comentario[] } = {};
        pComentsData.forEach((c: any) => {
          if (!pComentsObj[c.post_id]) pComentsObj[c.post_id] = [];
          pComentsObj[c.post_id].push({
            id: c.id,
            arte_id: c.post_id,
            nome: c.profiles?.nome || 'Utilizador',
            email: '',
            texto: c.texto,
            data: new Date(c.created_at).toLocaleDateString('pt-BR')
          });
        });
        setPostComentarios(pComentsObj);
      }
    } catch (err) {
      console.error('Erro ao carregar dados do Supabase:', err);
    }
  };

  useEffect(() => {
    carregarDadosDoBanco();
  }, [usuario]);

  useEffect(() => {
    localStorage.setItem('giovanni_meus_comentarios_ids', JSON.stringify(meusComentariosIds));
  }, [meusComentariosIds]);

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
        alert('Modo Administrador ativado com sucesso!');
      } else if (senhaInformada !== null) {
        alert('Senha incorreta!');
      }
    }
  };

  const toggleCurtirArte = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    if (!usuario) {
      alert('Você precisa estar cadastrado e logado para curtir!');
      setModoModal('cadastro');
      setModalAuthAberto(true);
      return;
    }

    const jaCurtiu = userLikes.includes(id);
    const atualLikes = likes[id] || 0;
    const novoTotal = jaCurtiu ? Math.max(0, atualLikes - 1) : atualLikes + 1;

    if (jaCurtiu) {
      setUserLikes(userLikes.filter(item => item !== id));
    } else {
      setUserLikes([...userLikes, id]);
    }
    setLikes(prev => ({ ...prev, [id]: novoTotal }));

    try {
      if (jaCurtiu) {
        await supabase
          .from('artes_likes')
          .delete()
          .eq('arte_id', id)
          .eq('user_id', usuario.id);
      } else {
        await supabase
          .from('artes_likes')
          .insert([{ arte_id: id, user_id: usuario.id }]);
      }
    } catch (err) {
      console.error('Erro ao atualizar curtida:', err);
      carregarDadosDoBanco();
    }
  };

  const toggleCurtirPost = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    if (!usuario) {
      alert('Você precisa estar cadastrado e logado para curtir!');
      setModoModal('cadastro');
      setModalAuthAberto(true);
      return;
    }

    const jaCurtiu = userPostLikes.includes(id);
    const atualLikes = postLikes[id] || 0;
    const novoTotal = jaCurtiu ? Math.max(0, atualLikes - 1) : atualLikes + 1;

    if (jaCurtiu) {
      setUserPostLikes(userPostLikes.filter(item => item !== id));
    } else {
      setUserPostLikes([...userPostLikes, id]);
    }
    setPostLikes(prev => ({ ...prev, [id]: novoTotal }));

    try {
      if (jaCurtiu) {
        await supabase
          .from('postagens_likes')
          .delete()
          .eq('post_id', id)
          .eq('user_id', usuario.id);
      } else {
        await supabase
          .from('postagens_likes')
          .insert([{ post_id: id, user_id: usuario.id }]);
      }
    } catch (err) {
      console.error('Erro ao atualizar curtida:', err);
      carregarDadosDoBanco();
    }
  };

  const handleAdicionarComentarioArte = async (id: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!usuario) {
      alert('Você precisa estar cadastrado e logado para comentar!');
      setModoModal('cadastro');
      setModalAuthAberto(true);
      return;
    }
    if (!novoTexto.trim()) return;

    try {
      const { data, error } = await supabase
        .from('artes_comentarios')
        .insert([{ arte_id: id, user_id: usuario.id, texto: novoTexto.trim() }])
        .select('*, profiles(nome, avatar_url)');

      if (!error && data) {
        const c = data[0];
        const novoComentarioFormatado: Comentario = {
          id: c.id,
          arte_id: c.arte_id,
          nome: c.profiles?.nome || 'Utilizador',
          email: '',
          texto: c.texto,
          data: new Date(c.created_at).toLocaleDateString('pt-BR')
        };
        setComentarios(prev => ({ ...prev, [id]: [...(prev[id] || []), novoComentarioFormatado] }));
        setMeusComentariosIds(prev => [...prev, c.id]);
        setNovoTexto('');
      }
    } catch (err) { console.error(err); }
  };

  const handleAdicionarComentarioPost = async (id: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!usuario) {
      alert('Você precisa estar cadastrado e logado para comentar!');
      setModoModal('cadastro');
      setModalAuthAberto(true);
      return;
    }
    if (!novoTexto.trim()) return;

    try {
      const { data, error } = await supabase
        .from('postagens_comentarios')
        .insert([{ post_id: id, user_id: usuario.id, texto: novoTexto.trim() }])
        .select('*, profiles(nome, avatar_url)');

      if (!error && data) {
        const c = data[0];
        const novoComentarioFormatado: Comentario = {
          id: c.id,
          arte_id: c.post_id,
          nome: c.profiles?.nome || 'Utilizador',
          email: '',
          texto: c.texto,
          data: new Date(c.created_at).toLocaleDateString('pt-BR')
        };
        setPostComentarios(prev => ({ ...prev, [id]: [...(prev[id] || []), novoComentarioFormatado] }));
        setMeusPostComentariosIds(prev => [...prev, c.id]);
        setNovoTexto('');
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

  const getBadgeStatus = (status: string) => {
    switch (status) {
      case 'Aprovado':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Enviado':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Concluído':
        return 'bg-violet-100 text-violet-800 border-violet-200';
      case 'Aguardando Pix':
      case 'Pendente':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f6]">
      <Header
        paginaAtual={paginaAtual}
        setPaginaAtual={setPaginaAtual}
        menuAberto={menuAberto}
        setMenuAberto={setMenuAberto}
        carrinhoQtd={carrinho.length}
        onOpenCarrinho={() => { setEtapaPagamento(false); setDadosPix(null); setCarrinhoAberto(true); }}
      />

      <div className="fixed bottom-6 right-6 lg:right-[340px] z-40 flex flex-col gap-2">
        {isAdmin && (
          <button
            onClick={carregarTodosPedidosAdmin}
            className="bg-gray-900 hover:bg-black text-white font-bold text-xs px-4 py-3 rounded-full shadow-xl transition cursor-pointer flex items-center gap-2"
          >
            ⚙️ Gestão Pedidos (Admin)
          </button>
        )}
        <button
          onClick={carregarMeusPedidos}
          className="bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs px-4 py-3 rounded-full shadow-xl transition cursor-pointer flex items-center gap-2"
        >
          📦 Meus Pedidos
        </button>
      </div>

      <div className="flex flex-col lg:flex-row pt-20 min-h-screen">

        <main className="flex-1 p-4 sm:p-8 flex flex-col gap-6 lg:mr-80">
          {paginaAtual === 'galeria' ? (
            <>
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
                    const estaVendida = arte.vendido || artesVendidasIds.includes(arte.id);
                    const jaCurtiu = userLikes.includes(arte.id);
                    const totalComentarios = (comentarios[arte.id] || []).length;
                    return (
                      <div key={arte.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 cursor-pointer group flex flex-col relative" onClick={() => setImagemSelecionada(arte)}>
                        <div className="overflow-hidden h-64 relative bg-gray-100">
                          {estaVendida ? (
                            <span className="absolute top-3 left-3 bg-rose-500 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-sm uppercase tracking-wider z-10">Vendida</span>
                          ) : (
                            <span className="absolute top-3 left-3 bg-emerald-600 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-sm uppercase tracking-wider z-10">Disponível</span>
                          )}
                          <img className="w-full h-full object-cover group-hover:scale-105 transition duration-500" src={arte.src} alt={arte.alt} />
                          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-medium">🔍 Ver detalhes</div>
                        </div>

                        <div className="p-4 bg-white flex flex-col gap-2">
                          <div className="flex items-start justify-between gap-3">
                            <span className="text-sm font-semibold text-gray-800 leading-snug flex-1">{arte.alt}</span>

                            <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                              {!estaVendida && (
                                <button
                                  onClick={() => adicionarAoCarrinho(arte)}
                                  className="w-9 h-9 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white transition cursor-pointer shadow-sm flex items-center justify-center"
                                  title="Adicionar à Sacola"
                                >
                                  <span className="text-sm">🛒</span>
                                </button>
                              )}
                              <span className="text-xs text-gray-400">💬 {totalComentarios}</span>
                              <button onClick={(e) => toggleCurtirArte(arte.id, e)} className={`flex items-center gap-1 px-3 py-1.5 rounded-full transition text-xs font-medium cursor-pointer active:scale-95 ${jaCurtiu ? 'bg-rose-50 text-rose-600 shadow-inner' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>
                                <span>{jaCurtiu ? '❤️' : '🤍'}</span>
                                <span>{likes[arte.id] || 0}</span>
                              </button>
                            </div>
                          </div>

                          {!estaVendida && (
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
                          <iframe src={post.src} className="w-full h-full object-cover pointer-events-none"></iframe>
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
        const estaVendidaModal = imagemSelecionada.vendido || artesVendidasIds.includes(imagemSelecionada.id);
        const jaCurtiuModal = userLikes.includes(imagemSelecionada.id);
        const listaComentarios = comentarios[imagemSelecionada.id] || [];

        return (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="relative max-w-2xl w-full max-h-[90vh] bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col">
              <button onClick={() => setImagemSelecionada(null)} className="absolute top-4 right-4 text-white text-xl font-bold bg-black/60 w-8 h-8 flex items-center justify-center rounded-full hover:bg-rose-600 transition cursor-pointer z-10">&times;</button>

              <div className="overflow-y-auto max-h-[90vh]">
                <div className="bg-black flex items-center justify-center max-h-[55vh] relative">
                  {estaVendidaModal ? (
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
                      {!estaVendidaModal && <span className="text-sm font-extrabold text-emerald-600">{typeof imagemSelecionada.preco === 'number' ? `R$ ${imagemSelecionada.preco.toFixed(2)}` : imagemSelecionada.preco}</span>}
                    </div>
                    <button onClick={(e) => toggleCurtirArte(imagemSelecionada.id, e)} className={`flex items-center gap-2 px-4 py-2 rounded-full transition font-bold cursor-pointer active:scale-95 ${jaCurtiuModal ? 'bg-rose-50 text-rose-600 shadow-inner' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>
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
                    <textarea placeholder={usuario ? "Escreva sua mensagem com carinho..." : "Faça login para comentar..."} value={novoTexto} onChange={(e) => setNovoTexto(e.target.value)} rows={2} className="text-xs p-2.5 rounded-xl border border-gray-300 bg-white resize-none focus:outline-none focus:ring-2 focus:ring-violet-500" required></textarea>
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
                    <button onClick={(e) => toggleCurtirPost(postagemSelecionada.id, e)} className={`flex items-center gap-2 px-4 py-2 rounded-full transition font-bold cursor-pointer active:scale-95 ${jaCurtiuModal ? 'bg-rose-50 text-rose-600 shadow-inner' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>
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
                    <textarea placeholder={usuario ? "Escreva sua mensagem com carinho..." : "Faça login para comentar..."} value={novoTexto} onChange={(e) => setNovoTexto(e.target.value)} rows={2} className="text-xs p-2.5 rounded-xl border border-gray-300 bg-white resize-none focus:outline-none focus:ring-2 focus:ring-violet-500" required></textarea>
                    <button type="submit" className="bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold py-2.5 px-5 rounded-xl transition self-end cursor-pointer shadow-sm">Enviar Comentário</button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* MODAIS ISOLADOS */}
      <CarrinhoModal
        carrinhoAberto={carrinhoAberto}
        setCarrinhoAberto={setCarrinhoAberto}
        carrinho={carrinho}
        removerDoCarrinho={removerDoCarrinho}
        etapaPagamento={etapaPagamento}
        setEtapaPagamento={setEtapaPagamento}
        dadosPix={dadosPix}
        setDadosPix={setDadosPix}
        cep={cep}
        setCep={setCep}
        endereco={endereco}
        setEndereco={setEndereco}
        calculandoFrete={calculandoFrete}
        calcularFreteCorreios={calcularFreteCorreios}
        infoCidade={infoCidade}
        opcoesFrete={opcoesFrete}
        freteSelecionado={freteSelecionado}
        setFreteSelecionado={setFreteSelecionado}
        subtotalCarrinho={subtotalCarrinho}
        valorFrete={valorFrete}
        valorTotalGeral={valorTotalGeral}
        usuario={usuario}
        setModoModal={setModoModal}
        setModalAuthAberto={setModalAuthAberto}
        initialization={initialization}
        customization={customization}
        onSubmitMercadoPago={onSubmitMercadoPago}
        carregarDadosDoBanco={carregarDadosDoBanco}
      />

      <MeusPedidosModal
        modalPedidosAberto={modalPedidosAberto}
        setModalPedidosAberto={setModalPedidosAberto}
        carregandoPedidos={carregandoPedidos}
        meusPedidos={meusPedidos}
        getBadgeStatus={getBadgeStatus}
        retomarPagamentoPedido={retomarPagamentoPedido}
        apagarMeuPedido={apagarMeuPedido}
      />

      <AdminPedidosModal
        modalAdminPedidosAberto={modalAdminPedidosAberto}
        setModalAdminPedidosAberto={setModalAdminPedidosAberto}
        carregandoPedidos={carregandoPedidos}
        todosPedidos={todosPedidos}
        isAdmin={isAdmin}
        getBadgeStatus={getBadgeStatus}
        editandoPedidoId={editandoPedidoId}
        setEditandoPedidoId={setEditandoPedidoId}
        novoStatus={novoStatus}
        setNovoStatus={setNovoStatus}
        novoRastreio={novoRastreio}
        setNovoRastreio={setNovoRastreio}
        salvarAlteracaoPedidoAdmin={salvarAlteracaoPedidoAdmin}
      />

      {/* Modal de Autenticação */}
      <AuthModal
        isOpen={modalAuthAberto}
        modoInicial={modoModal}
        onClose={() => setModalAuthAberto(false)}
        onLoginSuccess={() => setModalAuthAberto(false)}
      />

    </div>
  )
}

export default App;