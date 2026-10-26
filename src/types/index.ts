export interface Comentario {
  id: string | number;
  arte_id: string;
  nome: string;
  email: string;
  texto: string;
  data: string;
}

export interface Arte {
  id: string;
  src: string;
  alt: string;
  descricao: string;
  preco: number | string;
  vendido: boolean;
}

export interface Postagem {
  id: string;
  tipo: 'foto' | 'video' | 'vimeo';
  fotos?: string[];
  src?: string;
  capa?: string;
  legenda: string;
  data: string;
}