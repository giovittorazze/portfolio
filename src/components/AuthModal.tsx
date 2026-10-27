import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
  modoInicial?: 'login' | 'cadastro';
}

export function AuthModal({ 
  isOpen, 
  onClose, 
  onLoginSuccess, 
  modoInicial = 'login' 
}: AuthModalProps) {
  const [modo, setModo] = useState<'login' | 'cadastro'>(modoInicial);
  const [nome, setNome] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [cpf, setCpf] = useState('');
  const [endereco, setEndereco] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidadeEstado, setCidadeEstado] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [mensagem, setMensagem] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setModo(modoInicial);
      setMensagem(null);
    }
  }, [isOpen, modoInicial]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCarregando(true);
    setMensagem(null);

    try {
      if (modo === 'cadastro') {
        // Envia os dados adicionais via options.data para a Trigger do banco salvar automaticamente
        const { error } = await supabase.auth.signUp({
          email,
          password: senha,
          options: {
            data: {
              nome: nome.trim(),
              data_nascimento: dataNascimento,
              cpf: cpf.trim(),
              endereco: endereco.trim(),
              bairro: bairro.trim(),
              cidade_estado: cidadeEstado.trim()
            }
          }
        });

        if (error) throw error;

        setMensagem({
          tipo: 'sucesso',
          texto: '🎉 Cadastro realizado com sucesso! Faça login para continuar.'
        });
        setModo('login');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password: senha,
        });

        if (error) throw error;

        onLoginSuccess();
        onClose();
      }
    } catch (err: any) {
      setMensagem({
        tipo: 'erro',
        texto: err.message || 'Erro ao processar. Tente novamente.'
      });
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

        <h2 className="text-xl font-bold text-gray-800 mb-1">
          {modo === 'login' ? '🔑 Entrar no Atelier' : '📝 Criar sua Conta'}
        </h2>
        <p className="text-xs text-gray-500 mb-6">
          {modo === 'login'
            ? 'Acesse sua conta para interagir e acompanhar suas curtidas.'
            : 'Preencha os dados abaixo para se cadastrar.'}
        </p>

        {mensagem && (
          <div className={`p-3 rounded-xl text-xs mb-4 font-medium ${
            mensagem.tipo === 'sucesso' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
          }`}>
            {mensagem.texto}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3 max-h-[70vh] overflow-y-auto pr-1">
          {modo === 'cadastro' && (
            <>
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Nome Completo *</label>
                <input
                  type="text"
                  placeholder="Ex: Maria Silva"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-violet-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Data de Nascimento *</label>
                <input
                  type="date"
                  value={dataNascimento}
                  onChange={(e) => setDataNascimento(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-violet-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">CPF *</label>
                <input
                  type="text"
                  placeholder="000.000.000-00"
                  value={cpf}
                  onChange={(e) => setCpf(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-violet-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Endereço (Rua e número) *</label>
                <input
                  type="text"
                  placeholder="Ex: Rua das Flores, 123"
                  value={endereco}
                  onChange={(e) => setEndereco(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-violet-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Bairro *</label>
                <input
                  type="text"
                  placeholder="Ex: Centro"
                  value={bairro}
                  onChange={(e) => setBairro(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-violet-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Cidade / Estado *</label>
                <input
                  type="text"
                  placeholder="Ex: São Paulo / SP"
                  value={cidadeEstado}
                  onChange={(e) => setCidadeEstado(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-violet-500 outline-none"
                  required
                />
              </div>
            </>
          )}

          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">E-mail *</label>
            <input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-violet-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">Senha *</label>
            <input
              type="password"
              placeholder="••••••••"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-violet-500 outline-none"
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={carregando}
            className="mt-2 w-full bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs py-3 rounded-xl transition shadow-sm disabled:opacity-50 cursor-pointer"
          >
            {carregando ? 'Aguarde...' : modo === 'login' ? 'Entrar' : 'Cadastrar'}
          </button>
        </form>

        <div className="mt-6 text-center pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={() => {
              setModo(modo === 'login' ? 'cadastro' : 'login');
              setMensagem(null);
            }}
            className="text-xs text-violet-600 font-semibold hover:underline cursor-pointer"
          >
            {modo === 'login'
              ? 'Não tem uma conta? Cadastre-se'
              : 'Já possui uma conta? Faça login'}
          </button>
        </div>
      </div>
    </div>
  );
}