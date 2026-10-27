import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import type { User } from '@supabase/supabase-js';

interface PerfilModalProps {
  isOpen: boolean;
  onClose: () => void;
  usuario: User | null;
}

export function PerfilModal({ isOpen, onClose, usuario }: PerfilModalProps) {
  const [nome, setNome] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [cpf, setCpf] = useState('');
  const [endereco, setEndereco] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidadeEstado, setCidadeEstado] = useState('');
  const [emailAtual, setEmailAtual] = useState('');
  const [novoEmail, setNovoEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [mensagem, setMensagem] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null);

  useEffect(() => {
    if (usuario && isOpen) {
      setEmailAtual(usuario.email || '');
      setNovoEmail(usuario.email || '');
      carregarPerfil();
    }
  }, [usuario, isOpen]);

  const carregarPerfil = async () => {
    if (!usuario) return;
    const { data } = await supabase
      .from('profiles')
      .select('nome, data_nascimento, cpf, endereco, bairro, cidade_estado, avatar_url')
      .eq('id', usuario.id)
      .single();

    if (data) {
      setNome(data.nome || '');
      setDataNascimento(data.data_nascimento || '');
      setCpf(data.cpf || '');
      setEndereco(data.endereco || '');
      setBairro(data.bairro || '');
      setCidadeEstado(data.cidade_estado || '');
      setAvatarUrl(data.avatar_url || '');
    } else {
      const nomePadrao = usuario.email?.split('@')[0] || 'Utilizador';
      await supabase.from('profiles').upsert([
        { id: usuario.id, nome: nomePadrao }
      ]);
      setNome(nomePadrao);
    }
  };

  if (!isOpen || !usuario) return null;

  const handleUploadFoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;

      setCarregando(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${usuario.id}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: publicData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const novaUrl = publicData.publicUrl;

      await supabase
        .from('profiles')
        .update({ avatar_url: novaUrl })
        .eq('id', usuario.id);

      setAvatarUrl(novaUrl);
      setMensagem({ tipo: 'sucesso', texto: 'Foto de perfil atualizada com sucesso!' });
    } catch (err: any) {
      setMensagem({ tipo: 'erro', texto: 'Erro ao enviar a imagem: ' + err.message });
    } finally {
      setCarregando(false);
    }
  };

  const handleSalvarPerfil = async (e: React.FormEvent) => {
    e.preventDefault();
    setCarregando(true);
    setMensagem(null);

    try {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          nome: nome.trim(),
          data_nascimento: dataNascimento,
          endereco: endereco.trim(),
          bairro: bairro.trim(),
          cidade_estado: cidadeEstado.trim()
        })
        .eq('id', usuario.id);

      if (profileError) throw profileError;

      if (novoEmail !== emailAtual) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: novoEmail,
        });

        if (emailError) throw emailError;

        setMensagem({
          tipo: 'sucesso',
          texto: 'Dados salvos! Um link de confirmação foi enviado para o seu e-mail antigo para validar a alteração.'
        });
      } else {
        setMensagem({ tipo: 'sucesso', texto: 'Perfil atualizado com sucesso!' });
      }
    } catch (err: any) {
      setMensagem({ tipo: 'erro', texto: err.message || 'Erro ao atualizar dados.' });
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl font-bold w-8 h-8 flex items-center justify-center cursor-pointer"
        >
          &times;
        </button>

        <h2 className="text-xl font-bold text-gray-800 mb-4">⚙️ Editar Perfil</h2>

        {mensagem && (
          <div className={`p-3 rounded-xl text-xs mb-4 font-medium ${
            mensagem.tipo === 'sucesso' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
          }`}>
            {mensagem.texto}
          </div>
        )}

        <div className="flex flex-col items-center mb-6">
          <div className="relative w-20 h-20 rounded-full overflow-hidden bg-gray-100 border-2 border-violet-600 shadow-sm mb-2">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-2xl font-bold">
                {nome ? nome[0].toUpperCase() : '👤'}
              </div>
            )}
          </div>

          <label className="text-xs text-violet-600 font-semibold cursor-pointer hover:underline">
            <span>{carregando ? 'Enviando...' : 'Alterar foto de perfil'}</span>
            <input type="file" accept="image/*" onChange={handleUploadFoto} className="hidden" disabled={carregando} />
          </label>
        </div>

        <form onSubmit={handleSalvarPerfil} className="flex flex-col gap-3 max-h-[60vh] overflow-y-auto pr-1">
          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">Nome Completo</label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-violet-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">Data de Nascimento</label>
            <input
              type="date"
              value={dataNascimento}
              onChange={(e) => setDataNascimento(e.target.value)}
              className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-violet-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">CPF (Não pode ser alterado)</label>
            <input
              type="text"
              value={cpf}
              disabled
              className="w-full text-xs p-3 rounded-xl border border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed select-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">Endereço</label>
            <input
              type="text"
              value={endereco}
              onChange={(e) => setEndereco(e.target.value)}
              className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-violet-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">Bairro</label>
            <input
              type="text"
              value={bairro}
              onChange={(e) => setBairro(e.target.value)}
              className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-violet-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">Cidade / Estado</label>
            <input
              type="text"
              value={cidadeEstado}
              onChange={(e) => setCidadeEstado(e.target.value)}
              className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-violet-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">E-mail</label>
            <input
              type="email"
              value={novoEmail}
              onChange={(e) => setNovoEmail(e.target.value)}
              className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-violet-500 outline-none"
              required
            />
            <span className="text-[10px] text-gray-400 mt-1 block">
              * Alterar o e-mail exigirá confirmação de segurança.
            </span>
          </div>

          <button
            type="submit"
            disabled={carregando}
            className="mt-2 w-full bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs py-3 rounded-xl transition shadow-sm disabled:opacity-50 cursor-pointer"
          >
            {carregando ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </form>
      </div>
    </div>
  );
}