import type { Postagem } from '../types'

import Goku01 from "../assets/img/goku01.JPEG"
import Goku02 from "../assets/img/goku02.JPEG"
import Goku03 from "../assets/img/goku03.JPEG"
import Goku04 from "../assets/img/goku04.jpg"

export const galeriaPostagens: Postagem[] = [
  {
    id: 'post-1',
    tipo: 'vimeo',
    src: 'https://player.vimeo.com/video/1239287524',
    capa: Goku04,
    legenda: 'Andamento do projeto Goku SSJ 3, confere aí como está ficando. Comecei a trabalhar o fundo, está ficando show! ✨',
    data: '25/10/2026'
  },
  {
    id: 'post-2',
    tipo: 'foto',
    fotos: [Goku01, Goku02, Goku03],
    legenda: 'Bastidores do atelier: Comecei este novo desenho em folha A3, do personagem Goku na transformação de Super Saiyajin 3 do anime Dragon Ball Z. Deslize para ver mais! ✏️🎨',
    data: '19/10/2026'
  },
];