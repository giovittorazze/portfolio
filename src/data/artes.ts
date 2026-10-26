import type { Arte } from '../types'

import Cavalo from "../assets/img/cavalo.JPEG"
import Canario from "../assets/img/canarinho.JPEG"
import Aguia from "../assets/img/aguia.JPEG"
import Ganesha from "../assets/img/ganesha.JPEG"
import NSAparecida from "../assets/img/nsaparecida.JPEG"
import Iemanja from "../assets/img/iemanja.JPEG"
import MariaMadalena from "../assets/img/mariamadalena.JPEG"
import Oxum from "../assets/img/oxum.JPEG"
import TrancaRuas from "../assets/img/trancaruas.JPEG"
import MobiFraternidadeBranca from "../assets/img/mobifraternidadebranca.jpg"
import MobiOrixas from "../assets/img/mobiorixas.jpg"

export const galeriaArtes: Arte[] = [
  {
    id: 'cavalo',
    src: Cavalo,
    alt: 'Cavalo A4',
    descricao: 'É um símbolo de liberdade, força e poder. É visto como o ser que habita a fronteira entre o físico e o invisível. É associado a forças instintivas da psique, representando a energia bruta que pode ser guiada, mas nunca domada.',
    preco: 'A combinar',
    vendido: false
  },
  {
    id: 'canario',
    src: Canario,
    alt: 'Canarinho A4',
    descricao: 'O Canarinho é um símbolo de alegria, liberdade e harmonia. Representa criatividade, expressão artística e comunicação, tráz boa sorte e felicidade. Busque a expressão autêntica e harmoniosa do ser!',
    preco: 'A combinar',
    vendido: false
  },
  {
    id: 'aguia',
    src: Aguia,
    alt: 'Águia A3',
    descricao: 'A Águia é um símbolo de força e soberania, arquétipo de coragem, domínio e poder interior. Liberdade e propósito elevado, representa a alma que busca alturas maiores e vive guiada por um propósito elevado. Visão espiritual e clareza, simboliza a capacidade de enxergar além do óbvio, trazendo discernimento e orientação.',
    preco: 'A combinar',
    vendido: false
  },
  {
    id: 'ganesha',
    src: Ganesha,
    alt: 'Ganesha A3',
    descricao: 'Ganesha é um deus Hindú, da sabedoria, do início e do fim. É venerado como o eliminador de obstáculos e o trazedor de sucesso. Representa a sabedoria e a inteligência, simbolizando o conhecimento que transcende o mundo físico.',
    preco: 'A combinar',
    vendido: true
  },
  {
    id: 'nsaparecida',
    src: NSAparecida,
    alt: 'Mandala - Nossa Senhora Aparecida 80x80cm',
    descricao: 'A Padroeira do nosso Brasil, intercede por todos os que a invocam por fé. Parte da identidade brasileira, representa a humildade, reconstrução interior, símbolo de esperança, "nas águas turvas do caminho, Deus sempre coloca um sinal de esperança para aqueles que tem olhos de fé para enxergar".',
    preco: 'A combinar',
    vendido: false
  },
  {
    id: 'iemanja',
    src: Iemanja,
    alt: 'Mandala - Iemanjá 60x60cm',
    descricao: 'Iemanjá é a divindade do rio que deságua no mar, a rainha dos oceanos e mãe de todos os Orixás. Representa o poder progenitor feminino, é a que nos faz nascer, divindade que é maternidade universal, a mãe do Mundo. A protetora dos Marinheiros, da maternidade e fertilidade.',
    preco: 'A combinar',
    vendido: false
  },
  {
    id: 'mariamadalena',
    src: MariaMadalena,
    alt: 'Mandala - Maria Madalena 60x60cm',
    descricao: 'É a figura central na devoção cristã, especialmente entre as mulheres. É venerada como uma das seguidoras mais fiéis de Cristo. A devoção a Maria Madalena envolve orações e preces que buscam sua intercessão para arrependimento, perdão e renovação. Padroeira dos pecadores, arrependidos, as mulheres e as pessoas que enfrentam dificuldades em sua vida.',
    preco: 'A combinar',
    vendido: false
  },
  {
    id: 'oxum',
    src: Oxum,
    alt: 'Mandala - Oxum 60x60cm',
    descricao: '(Pequeno detalhe na parte inferior esquerda) Rainha das águas doces, dona dos rios e cachoeiras, considerada a senhora da beleza, da fertilidade, do amor, do dinheiro, da sensibilidade. Associada a riqueza espiritual e material.',
    preco: 'A combinar',
    vendido: false
  },
  {
    id: 'trancaruas',
    src: TrancaRuas,
    alt: 'Mandala - Exú Tranca Ruas 55x55cm',
    descricao: 'Guardião dos caminhos, protetor espiritual e mensageiro dos Orixás, ele abre ou fecha as portas na vida dos devotos, de acordo com o merecimento da pessoa. Quem está em sintonia com a verdade e busca crescimento pode contar com sua ajuda para superar obstáculos.',
    preco: 'A combinar',
    vendido: false
  },
  {
    id: 'mobifraternidadebranca',
    src: MobiFraternidadeBranca,
    alt: 'Mobile 7 Raios Cósmicos, a Fraternidade Branca & os 7 Chakras 120x9cm',
    descricao: 'Os 7 Raios Cósmicos, são as principais forças de energia espiritual que influenciam a vida na Terra, sendo transmitidos pelo Sol e outros astros. A Fraternidade Branca é uma irmandade espiritual que busca a evolução da humanidade, promovendo a paz, a harmonia e o desenvolvimento espiritual. Os Chakras são centros de energia no corpo humano, cada um associado a diferentes aspectos físicos, emocionais e espirituais.',
    preco: 'A combinar',
    vendido: true
  },
  {
    id: 'mobiorixas',
    src: MobiOrixas,
    alt: 'Mobile Orixás & Elementos 80x10cm',
    descricao: 'Mobile artístico dos Orixás & Elementos, onde cada um representa um elemento da natureza, Terra: Oxóssi, Fogo: Xangô, Água: Iemanjá, Ar: Iansã, ideal para decoração espiritual e harmonia do ambiente.',
    preco: 'A combinar',
    vendido: false
  },
];