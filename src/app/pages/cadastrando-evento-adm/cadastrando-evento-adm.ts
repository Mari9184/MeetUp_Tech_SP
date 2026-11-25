import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { take } from 'rxjs';
import { MenuLateral } from '../../componentes/menu-lateral/menu-lateral';
import { EventosService } from '../../services/eventos.service';

export type FormatoEvento = 'presencial' | 'online' | 'hibrido';

export interface OpcaoPublico {
  valor: string;
  rotulo: string;
}

export interface OpcaoSelo {
  id: string;
  rotulo: string;
  classeCor: 'selo-laranja' | 'selo-azul' | 'selo-roxo' | 'selo-rosa' | 'selo-cinza';
}

interface RespostaViaCep {
  erro?: boolean;
  logradouro?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
}

interface EstacaoReferenciaSp {
  nome: string;
  linha: string;
  lat: number;
  lon: number;
  bairrosChave?: string[];
}

interface ResultadoNominatim {
  lat: string;
  lon: string;
}

const ESTACOES_SP: EstacaoReferenciaSp[] = [
  { nome: 'Estação Sé', linha: 'Linha 1-Azul / Linha 3-Vermelha', lat: -23.5503, lon: -46.6339, bairrosChave: ['sé', 'centro', 'liberdade'] },
  { nome: 'Estação República', linha: 'Linha 3-Vermelha / Linha 4-Amarela', lat: -23.5441, lon: -46.6425, bairrosChave: ['república', 'centro', 'consolação'] },
  { nome: 'Estação Anhangabaú', linha: 'Linha 3-Vermelha', lat: -23.5481, lon: -46.6378, bairrosChave: ['centro', 'anhangabaú'] },
  { nome: 'Estação Luz', linha: 'Linha 1-Azul / Linha 4-Amarela / CPTM', lat: -23.5365, lon: -46.6353, bairrosChave: ['luz', 'bom retiro', 'campos elíseos'] },
  { nome: 'Estação Tiradentes', linha: 'Linha 1-Azul', lat: -23.5322, lon: -46.6322, bairrosChave: ['bom retiro', 'ponte pequena'] },
  { nome: 'Estação São Bento', linha: 'Linha 1-Azul', lat: -23.5432, lon: -46.6341, bairrosChave: ['centro', 'são bento'] },
  { nome: 'Estação Japão-Liberdade', linha: 'Linha 1-Azul', lat: -23.5553, lon: -46.6356, bairrosChave: ['liberdade', 'aclimação'] },
  { nome: 'Estação Paraíso', linha: 'Linha 1-Azul / Linha 2-Verde', lat: -23.5764, lon: -46.6407, bairrosChave: ['paraíso', 'vila mariana'] },
  { nome: 'Estação Ana Rosa', linha: 'Linha 1-Azul / Linha 2-Verde', lat: -23.5815, lon: -46.6383, bairrosChave: ['vila mariana', 'ana rosa'] },
  { nome: 'Estação Vila Mariana', linha: 'Linha 1-Azul', lat: -23.5895, lon: -46.6345, bairrosChave: ['vila mariana'] },
  { nome: 'Estação Santa Cruz', linha: 'Linha 1-Azul / Linha 5-Lilás', lat: -23.5988, lon: -46.6365, bairrosChave: ['vila mariana', 'saúde'] },
  { nome: 'Estação Saúde', linha: 'Linha 1-Azul', lat: -23.6067, lon: -46.6365, bairrosChave: ['saúde', 'planalto paulista'] },
  { nome: 'Estação Jabaquara', linha: 'Linha 1-Azul', lat: -23.6463, lon: -46.6408, bairrosChave: ['jabaquara', 'cidade vargas'] },
  { nome: 'Estação Paulista', linha: 'Linha 4-Amarela', lat: -23.5547, lon: -46.6624, bairrosChave: ['bela vista', 'cerqueira césar', 'consolação'] },
  { nome: 'Estação Consolação', linha: 'Linha 2-Verde', lat: -23.5576, lon: -46.6606, bairrosChave: ['consolação', 'cerqueira césar', 'jardins'] },
  { nome: 'Estação Trianon-Masp', linha: 'Linha 2-Verde', lat: -23.5637, lon: -46.6555, bairrosChave: ['bela vista', 'cerqueira césar', 'jardim paulista'] },
  { nome: 'Estação Brigadeiro', linha: 'Linha 2-Verde', lat: -23.5686, lon: -46.6479, bairrosChave: ['bela vista', 'paraíso', 'jardim paulista'] },
  { nome: 'Estação Clinicas', linha: 'Linha 2-Verde', lat: -23.5541, lon: -46.6699, bairrosChave: ['cerqueira césar', 'pinheiros', 'sumaré'] },
  { nome: 'Estação Sumaré', linha: 'Linha 2-Verde', lat: -23.5491, lon: -46.6789, bairrosChave: ['sumaré', 'perdizes'] },
  { nome: 'Estação Vila Madalena', linha: 'Linha 2-Verde', lat: -23.5466, lon: -46.6909, bairrosChave: ['vila madalena', 'pinheiros'] },
  { nome: 'Estação Fradique Coutinho', linha: 'Linha 4-Amarela', lat: -23.5662, lon: -46.6844, bairrosChave: ['pinheiros'] },
  { nome: 'Estação Faria Lima', linha: 'Linha 4-Amarela', lat: -23.5673, lon: -46.6939, bairrosChave: ['pinheiros', 'itaim bibi'] },
  { nome: 'Estação Pinheiros', linha: 'Linha 4-Amarela / Linha 9-Esmeralda', lat: -23.5669, lon: -46.7016, bairrosChave: ['pinheiros', 'butantã'] },
  { nome: 'Estação Butantã', linha: 'Linha 4-Amarela', lat: -23.5718, lon: -46.7082, bairrosChave: ['butantã'] },
  { nome: 'Estação Barra Funda', linha: 'Linha 3-Vermelha / CPTM', lat: -23.5255, lon: -46.6673, bairrosChave: ['barra funda', 'água branca'] },
  { nome: 'Estação Santa Cecília', linha: 'Linha 3-Vermelha', lat: -23.5393, lon: -46.6494, bairrosChave: ['santa cecília', 'higienópolis'] },
  { nome: 'Estação Marechal Deodoro', linha: 'Linha 3-Vermelha', lat: -23.5342, lon: -46.6562, bairrosChave: ['santa cecília', 'barra funda'] },
  { nome: 'Estação Brás', linha: 'Linha 3-Vermelha / CPTM', lat: -23.5469, lon: -46.6159, bairrosChave: ['brás', 'pari', 'belenzinho'] },
  { nome: 'Estação Tatuapé', linha: 'Linha 3-Vermelha / Linha 11-Coral', lat: -23.5406, lon: -46.5764, bairrosChave: ['tatuapé', 'cidade mãe do céu'] },
  { nome: 'Estação Carrão', linha: 'Linha 3-Vermelha', lat: -23.5378, lon: -46.5618, bairrosChave: ['vila carrão', 'tatuapé'] },
  { nome: 'Estação Penha', linha: 'Linha 3-Vermelha', lat: -23.5335, lon: -46.5427, bairrosChave: ['penha'] },
  { nome: 'Estação Artur Alvim', linha: 'Linha 3-Vermelha', lat: -23.5407, lon: -46.4844, bairrosChave: ['artur alvim', 'cidade a.e. carvalho'] },
  { nome: 'Estação Corinthians-Itaquera', linha: 'Linha 3-Vermelha / Linha 11-Coral', lat: -23.5422, lon: -46.4712, bairrosChave: ['itaquera', 'parque do carmo'] },
  { nome: 'Estação Brooklin', linha: 'Linha 5-Lilás', lat: -23.6129, lon: -46.6889, bairrosChave: ['brooklin', 'campo belo', 'itaim bibi'] },
  { nome: 'Estação Campo Belo', linha: 'Linha 5-Lilás', lat: -23.6194, lon: -46.6788, bairrosChave: ['campo belo', 'brooklin'] },
  { nome: 'Estação Eucaliptos', linha: 'Linha 5-Lilás', lat: -23.6098, lon: -46.6691, bairrosChave: ['indianópolis', 'moema'] },
  { nome: 'Estação Moema', linha: 'Linha 5-Lilás', lat: -23.6036, lon: -46.6624, bairrosChave: ['moema', 'indianópolis'] },
  { nome: 'Estação AACD-Servidor', linha: 'Linha 5-Lilás', lat: -23.5978, lon: -46.6523, bairrosChave: ['vila clementino', 'ibirapuera'] },
  { nome: 'Estação Santo Amaro', linha: 'Linha 5-Lilás / Linha 9-Esmeralda', lat: -23.6544, lon: -46.7103, bairrosChave: ['santo amaro', 'chácara santo antônio', 'jurubatuba'] },
  { nome: 'Estação Granja Julieta', linha: 'Linha 9-Esmeralda', lat: -23.6331, lon: -46.7031, bairrosChave: ['chácara santo antônio', 'santo amaro', 'morumbi'] },
  { nome: 'Estação Morumbi', linha: 'Linha 9-Esmeralda', lat: -23.6227, lon: -46.7016, bairrosChave: ['brooklin', 'morumbi', 'chácara itaim'] },
  { nome: 'Estação Berrini', linha: 'Linha 9-Esmeralda', lat: -23.6104, lon: -46.6989, bairrosChave: ['brooklin', 'itaim bibi', 'cidade monções'] },
  { nome: 'Estação Vila Olímpia', linha: 'Linha 9-Esmeralda', lat: -23.5955, lon: -46.6897, bairrosChave: ['vila olímpia', 'itaim bibi'] },
  { nome: 'Estação Cidade Jardim', linha: 'Linha 9-Esmeralda', lat: -23.5829, lon: -46.6978, bairrosChave: ['pinheiros', 'jardim paulistano'] },
  { nome: 'Estação Hebraica-Rebouças', linha: 'Linha 9-Esmeralda', lat: -23.5721, lon: -46.7003, bairrosChave: ['pinheiros', 'butantã'] },
  { nome: 'Estação Tamanduateí', linha: 'Linha 2-Verde / Linha 10-Turquesa', lat: -23.5914, lon: -46.5898, bairrosChave: ['vila prudente', 'ipiranga'] },
  { nome: 'Estação Sacomã', linha: 'Linha 2-Verde / Expresso Tiradentes', lat: -23.6015, lon: -46.6033, bairrosChave: ['sacomã', 'ipiranga'] },
  { nome: 'Estação Vila Prudente', linha: 'Linha 2-Verde / Linha 15-Prata', lat: -23.5844, lon: -46.5821, bairrosChave: ['vila prudente'] },
  { nome: 'Estação Varginha', linha: 'Linha 9-Esmeralda', lat: -23.7708, lon: -46.7119, bairrosChave: ['vila natal', 'jardim maria fernandes', 'grajaú'] },

];

@Component({
  imports: [MenuLateral, FormsModule, RouterLink],
  selector: 'app-cadastrando-evento-adm',
  styleUrl: './cadastrando-evento-adm.css',
  templateUrl: './cadastrando-evento-adm.html',
})
export class CadastrandoEventoAdm {
  private eventosService = inject(EventosService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  readonly opcoesArea = [
    'Dev · Front-end',
    'Dados',
    'UX/UI',
    'Cloud',
    'Inteligência Artificial',
    'Segurança',
  ];

  readonly opcoesPublico: OpcaoPublico[] = [
    { valor: 'todos', rotulo: 'Todos os níveis' },
    { valor: 'iniciantes', rotulo: 'Iniciantes' },
    { valor: 'mulheres', rotulo: 'Mulheres na Tech' },
    { valor: 'intermediario', rotulo: 'Intermediário/Avançado' },
    { valor: 'membros', rotulo: 'Exclusivo membros' },
  ];

  readonly opcoesSelos: OpcaoSelo[] = [
    { id: 'vagas-limitadas', rotulo: 'VAGAS LIMITADAS', classeCor: 'selo-laranja' },
    { id: 'iniciantes', rotulo: 'INICIANTES', classeCor: 'selo-azul' },
    { id: 'exclusivo', rotulo: 'EXCLUSIVO', classeCor: 'selo-roxo' },
    { id: 'mulheres-na-tech', rotulo: 'MULHERES NA TECH', classeCor: 'selo-rosa' },
    { id: 'encerrado', rotulo: 'ENCERRADO', classeCor: 'selo-cinza' },
  ];

  eventoId = signal<string | null>(null);
  modoEdicao = computed(() => Boolean(this.eventoId()));

  salvando = signal(false);
  erro = signal('');
  mensagemSucesso = signal('');

  // Campos vazios por padrão para novo cadastro
  titulo = signal('');
  area = signal('Dev · Front-end');
  empresa = signal('');
  descricao = signal('');

  dataEvento = signal('');
  horarioInicio = signal('');
  horarioTermino = signal('');
  formato = signal<FormatoEvento>('presencial');
  isOnline = computed(() => this.formato() === 'online');

  cep = signal('');
  numeroEndereco = signal('');
  local = signal('');
  estacao = signal('');

  buscandoCep = signal(false);
  buscandoEstacao = signal(false);
  avisoCep = signal('');
  private ultimoDadosCep: RespostaViaCep | null = null;

  linkInscricao = signal('');
  publicosSelecionados = signal<string[]>([]);
  selosSelecionados = signal<string[]>([]);

  totalCaracteres = computed(() => this.descricao().length);

  mesCartao = computed(() => {
    const data = this.parseData(this.dataEvento());
    if (!data) return 'MÊS';
    return new Intl.DateTimeFormat('pt-BR', { month: 'short' })
      .format(data)
      .replace('.', '')
      .toUpperCase();
  });

  diaCartao = computed(() => {
    const data = this.parseData(this.dataEvento());
    if (!data) return '--';
    return String(data.getDate()).padStart(2, '0');
  });

  dataDetalhePrevia = computed(() => {
    const data = this.parseData(this.dataEvento());
    const inicio = this.horarioInicio().trim();
    const termino = this.horarioTermino().trim();

    const faixaHora = inicio && termino ? `${inicio} – ${termino}` : inicio || termino;

    if (!data) {
      return faixaHora || 'Data a definir';
    }

    const diaSemana = new Intl.DateTimeFormat('pt-BR', { weekday: 'short' })
      .format(data)
      .replace('.', '');
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = new Intl.DateTimeFormat('pt-BR', { month: 'short' })
      .format(data)
      .replace('.', '');

    const capitalizado = diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1);
    const dataTexto = `${capitalizado}, ${dia} ${mes}`;
    return faixaHora ? `${dataTexto} · ${faixaHora}` : dataTexto;
  });

  selosAtivosView = computed(() => {
    const ativos = new Set(this.selosSelecionados());
    return this.opcoesSelos.filter((s) => ativos.has(s.id));
  });

  completude = computed(() => {
    const temBasico = Boolean(
      this.titulo().trim() && this.area().trim() && this.empresa().trim(),
    );
    const temDataFormato = Boolean(
      this.dataEvento().trim() && this.horarioInicio().trim() && this.formato(),
    );
    const temLocal = this.isOnline() || Boolean(this.local().trim());
    const temPublico = this.publicosSelecionados().length > 0;
    const temLink = this.linkValido(this.linkInscricao());

    const itens = [
      { rotulo: 'Título, área e empresa', completo: temBasico },
      { rotulo: 'Data, horário e formato', completo: temDataFormato },
      {
        rotulo: this.isOnline() ? 'Formato online definido' : 'Local e estação por perto',
        completo: temLocal,
      },
      { rotulo: 'Público-alvo', completo: temPublico },
      { rotulo: 'Link de inscrição válido', completo: temLink },
    ];

    const pontos = itens.filter((i) => i.completo).length * 2;
    return {
      pontos,
      totalPontos: 10,
      itens,
    };
  });

  constructor() {
    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        const id = params.get('id');
        if (id) {
          this.eventoId.set(id);
          this.carregarEventoExistente(id);
        } else {
          this.eventoId.set(null);
        }
      });
  }

  selecionarFormato(novoFormato: FormatoEvento) {
    this.formato.set(novoFormato);
    if (novoFormato === 'online') {
      this.cep.set('');
      this.numeroEndereco.set('');
      this.local.set('');
      this.estacao.set('');
      this.avisoCep.set('');
      this.ultimoDadosCep = null;
    }
  }

  publicoMarcado(valor: string): boolean {
    return this.publicosSelecionados().includes(valor);
  }

  alternarPublico(valor: string) {
    const atual = this.publicosSelecionados();
    if (atual.includes(valor)) {
      this.publicosSelecionados.set(atual.filter((item) => item !== valor));
    } else {
      this.publicosSelecionados.set([...atual, valor]);
    }
  }

  seloMarcado(id: string): boolean {
    return this.selosSelecionados().includes(id);
  }

  alternarSelo(id: string) {
    const atual = this.selosSelecionados();
    if (atual.includes(id)) {
      this.selosSelecionados.set(atual.filter((item) => item !== id));
    } else {
      this.selosSelecionados.set([...atual, id]);
    }
  }

  atualizarCep(valor: string) {
    const digitos = valor.replace(/\D/g, '').slice(0, 8);
    if (digitos.length > 5) {
      this.cep.set(`${digitos.slice(0, 5)}-${digitos.slice(5)}`);
    } else {
      this.cep.set(digitos);
    }
    this.avisoCep.set('');
  }

  atualizarNumeroEndereco(valor: string) {
    this.numeroEndereco.set(valor);
    if (this.ultimoDadosCep) {
      this.local.set(this.montarEnderecoCompleto(this.ultimoDadosCep, this.cep(), valor));
    }
  }

  async buscarCep() {
    if (this.isOnline()) return;

    const cepLimpo = this.cep().replace(/\D/g, '');
    if (!cepLimpo) {
      this.avisoCep.set('');
      return;
    }

    if (cepLimpo.length !== 8) {
      this.avisoCep.set('Digite um CEP válido com 8 dígitos.');
      return;
    }

    const cepFormatado = `${cepLimpo.slice(0, 5)}-${cepLimpo.slice(5)}`;
    this.cep.set(cepFormatado);
    this.buscandoCep.set(true);
    this.avisoCep.set('');

    try {
      const resposta = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      if (!resposta.ok) {
        throw new Error('Falha ao consultar CEP');
      }

      const dados = (await resposta.json()) as RespostaViaCep;
      if (dados.erro) {
        this.ultimoDadosCep = null;
        this.avisoCep.set('CEP não encontrado. Preencha o endereço manualmente.');
        return;
      }

      this.ultimoDadosCep = dados;
      this.local.set(
        this.montarEnderecoCompleto(dados, cepFormatado, this.numeroEndereco()),
      );

      await this.localizarEstacaoMaisProxima(dados, this.numeroEndereco());
    } catch {
      this.ultimoDadosCep = null;
      this.avisoCep.set('Não foi possível consultar o CEP agora. Preencha o local manualmente.');
    } finally {
      this.buscandoCep.set(false);
    }
  }

  private async localizarEstacaoMaisProxima(dados: RespostaViaCep, numeroBruto: string) {
    this.buscandoEstacao.set(true);

    try {
      const coords = await this.buscarCoordenadasEndereco(dados, numeroBruto);
      if (coords) {
        let maisProxima: EstacaoReferenciaSp | null = null;
        let menorDistanciaKm = Number.POSITIVE_INFINITY;

        for (const estacao of ESTACOES_SP) {
          const dist = this.distanciaHaversineKm(coords.lat, coords.lon, estacao.lat, estacao.lon);
          if (dist < menorDistanciaKm) {
            menorDistanciaKm = dist;
            maisProxima = estacao;
          }
        }

        if (maisProxima && menorDistanciaKm <= 6) {
          this.estacao.set(`${maisProxima.nome} · ${maisProxima.linha}`);
          return;
        }
      }

      const fallbackBairro = this.buscarEstacaoPorBairro(dados.bairro ?? '');
      if (fallbackBairro) {
        this.estacao.set(`${fallbackBairro.nome} · ${fallbackBairro.linha}`);
      }
    } catch {
      const fallbackBairro = this.buscarEstacaoPorBairro(dados.bairro ?? '');
      if (fallbackBairro) {
        this.estacao.set(`${fallbackBairro.nome} · ${fallbackBairro.linha}`);
      }
    } finally {
      this.buscandoEstacao.set(false);
    }
  }

  private async buscarCoordenadasEndereco(
    dados: RespostaViaCep,
    numeroBruto: string,
  ): Promise<{ lat: number; lon: number } | null> {
    const logradouro = (dados.logradouro ?? '').trim();
    const cidade = (dados.localidade ?? 'São Paulo').trim();
    const uf = (dados.uf ?? 'SP').trim();
    const numero = numeroBruto.trim();

    const consulta = [
      [logradouro, numero].filter(Boolean).join(', '),
      cidade,
      uf,
      'Brasil',
    ]
      .filter(Boolean)
      .join(', ');

    if (!consulta) return null;

    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(consulta)}`;
    const resposta = await fetch(url, {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!resposta.ok) {
      return null;
    }

    const itens = (await resposta.json()) as ResultadoNominatim[];
    if (!Array.isArray(itens) || itens.length === 0) {
      return null;
    }

    const lat = Number(itens[0].lat);
    const lon = Number(itens[0].lon);

    if (Number.isNaN(lat) || Number.isNaN(lon)) {
      return null;
    }

    return { lat, lon };
  }

  private buscarEstacaoPorBairro(bairro: string): EstacaoReferenciaSp | null {
    const bairroNormalizado = this.normalizarTexto(bairro);
    if (!bairroNormalizado) return null;

    for (const estacao of ESTACOES_SP) {
      const chaves = estacao.bairrosChave ?? [];
      if (chaves.some((chave) => bairroNormalizado.includes(this.normalizarTexto(chave)))) {
        return estacao;
      }
    }

    return null;
  }

  private distanciaHaversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const raioTerraKm = 6371;
    const dLat = this.grausParaRadianos(lat2 - lat1);
    const dLon = this.grausParaRadianos(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.grausParaRadianos(lat1)) *
        Math.cos(this.grausParaRadianos(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return raioTerraKm * c;
  }

  private grausParaRadianos(graus: number): number {
    return (graus * Math.PI) / 180;
  }

  private normalizarTexto(texto: string): string {
    return texto
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }

  private montarEnderecoCompleto(
    dados: RespostaViaCep,
    cepFormatado: string,
    numeroBruto: string,
  ): string {
    const logradouroFormatado = this.abreviarLogradouro(dados.logradouro ?? '');
    const numero = numeroBruto.trim();
    const ruaComNumero = numero ? `${logradouroFormatado}, ${numero}` : logradouroFormatado;
    const bairro = dados.bairro?.trim() ?? '';
    const cidade = dados.localidade?.trim() ?? '';
    const uf = dados.uf?.trim().toUpperCase() ?? '';
    const cidadeUf = cidade && uf ? `${cidade} - ${uf}` : cidade || uf;

    const parteLocalidade =
      ruaComNumero && bairro
        ? `${ruaComNumero} - ${bairro}`
        : ruaComNumero || bairro;

    return [parteLocalidade, cidadeUf, cepFormatado].filter(Boolean).join(', ');
  }

  private abreviarLogradouro(logradouro: string): string {
    return logradouro
      .trim()
      .replace(/^Rua\s+/i, 'R. ')
      .replace(/^Avenida\s+/i, 'Av. ')
      .replace(/^Alameda\s+/i, 'Al. ')
      .replace(/^Travessa\s+/i, 'Tv. ')
      .replace(/^Rodovia\s+/i, 'Rod. ')
      .replace(/\bDoutor\b/gi, 'Dr.')
      .replace(/\bDoutora\b/gi, 'Dra.')
      .replace(/\bProfessor\b/gi, 'Prof.')
      .replace(/\bProfessora\b/gi, 'Profa.')
      .replace(/\bGeneral\b/gi, 'Gen.')
      .replace(/\bCoronel\b/gi, 'Cel.')
      .replace(/\bPresidente\b/gi, 'Pres.');
  }

  async aoSubmitFormulario(event: Event) {
    event.preventDefault();
    await this.salvarEvento('Publicado');
  }

  async salvarRascunho() {
    await this.salvarEvento('Rascunho');
  }

  async cancelarEventoExistente() {
    const id = this.eventoId();
    if (!id || this.salvando()) return;

    const confirmou = window.confirm(
      `Deseja marcar "${this.titulo().trim() || 'este evento'}" como Cancelado?`,
    );
    if (!confirmou) return;

    this.salvando.set(true);
    this.erro.set('');
    this.mensagemSucesso.set('');

    try {
      await this.eventosService.atualizarEvento(id, {
        status: 'Cancelado',
        atualizado_em: new Date().toISOString(),
      });
      this.mensagemSucesso.set('Evento marcado como cancelado.');
      await this.router.navigate(['/eventos']);
    } catch (err: unknown) {
      console.error('Erro ao cancelar evento:', err);
      this.erro.set('Não foi possível cancelar o evento.');
    } finally {
      this.salvando.set(false);
    }
  }

  private async salvarEvento(status: 'Publicado' | 'Rascunho') {
    if (this.salvando()) return;

    this.erro.set('');
    this.mensagemSucesso.set('');

    const tituloLimpo = this.titulo().trim();
    const areaLimpa = this.area().trim();
    const empresaLimpa = this.empresa().trim();
    const dataLimpa = this.dataEvento().trim();
    const inicioLimpo = this.horarioInicio().trim();
    const online = this.isOnline();
    const localLimpo = online ? 'Online' : this.local().trim();
    const linkLimpo = this.linkInscricao().trim();

    if (status === 'Publicado') {
      if (
        !tituloLimpo ||
        !areaLimpa ||
        !empresaLimpa ||
        !dataLimpa ||
        !inicioLimpo ||
        (!online && !localLimpo)
      ) {
        this.erro.set('Preencha todos os campos obrigatórios (*) antes de publicar.');
        return;
      }
      if (!linkLimpo || !this.linkValido(linkLimpo)) {
        this.erro.set('Informe um link de inscrição válido (começando com http:// ou https://).');
        return;
      }
    } else if (!tituloLimpo) {
      this.erro.set('Informe pelo menos o título do evento para salvar o rascunho.');
      return;
    }

    this.salvando.set(true);

    const formatoRotulo = this.rotuloFormato(this.formato());
    const horarioResumo = this.horarioTermino().trim()
      ? `${inicioLimpo} – ${this.horarioTermino().trim()}`
      : inicioLimpo;

    const payload: Record<string, unknown> = {
      titulo: tituloLimpo,
      tema: areaLimpa,
      area: areaLimpa,
      empresa_comunidade: empresaLimpa,
      empresa: empresaLimpa,
      descricao: this.descricao().trim(),
      data_evento: this.normalizarDataParaBanco(dataLimpa),
      horario: horarioResumo,
      horario_inicio: inicioLimpo,
      horario_termino: this.horarioTermino().trim(),
      formato: formatoRotulo,
      cep: online ? '' : this.cep().trim(),
      numero_endereco: online ? '' : this.numeroEndereco().trim(),
      local: localLimpo,
      estacao_proxima: online ? '' : this.estacao().trim(),
      link_inscricao: linkLimpo,
      publico_alvo: this.publicosSelecionados(),
      selos: this.selosSelecionados(),
      status,
    };

    try {
      const idAtual = this.eventoId();
      if (idAtual) {
        await this.eventosService.atualizarEvento(idAtual, {
          ...payload,
          atualizado_em: new Date().toISOString(),
        });
        this.mensagemSucesso.set(
          status === 'Rascunho' ? 'Rascunho atualizado.' : 'Evento atualizado com sucesso.',
        );
      } else {
        await this.eventosService.criarEvento({
          ...payload,
          participantes_grupo: [],
          criado_em: new Date().toISOString(),
        });
        this.mensagemSucesso.set(
          status === 'Rascunho' ? 'Rascunho salvo.' : 'Evento publicado com sucesso.',
        );
      }

      await this.router.navigate(['/eventos']);
    } catch (err: unknown) {
      console.error('Erro ao salvar evento:', err);
      this.erro.set('Não foi possível salvar o evento no banco.');
    } finally {
      this.salvando.set(false);
    }
  }

  private carregarEventoExistente(id: string) {
    this.eventosService
      .listarEventos()
      .pipe(take(1), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (lista) => {
          const encontrado = (lista ?? []).find((item) => {
            const raw = item as unknown as Record<string, unknown>;
            return raw['documentId'] === id || raw['id'] === id;
          });
          if (!encontrado) {
            this.erro.set('Evento não encontrado para edição.');
            return;
          }

          const raw = encontrado as unknown as Record<string, unknown>;
          this.titulo.set(this.texto(raw['titulo']));
          this.area.set(this.texto(raw['tema'] ?? raw['area']) || 'Dev · Front-end');
          this.empresa.set(this.texto(raw['empresa_comunidade'] ?? raw['empresa']));
          this.descricao.set(this.texto(raw['descricao']));

          const dataObj = this.parseData(raw['data_evento'] ?? raw['data']);
          if (dataObj) {
            const d = String(dataObj.getDate()).padStart(2, '0');
            const m = String(dataObj.getMonth() + 1).padStart(2, '0');
            const a = dataObj.getFullYear();
            this.dataEvento.set(`${d}/${m}/${a}`);
          }

          const inicio = this.texto(raw['horario_inicio']);
          const termino = this.texto(raw['horario_termino']);
          const horarioGeral = this.texto(raw['horario']);
          if (inicio) {
            this.horarioInicio.set(inicio);
            this.horarioTermino.set(termino);
          } else if (horarioGeral.includes('–')) {
            const [ini, fim] = horarioGeral.split('–').map((p) => p.trim());
            this.horarioInicio.set(ini || '');
            this.horarioTermino.set(fim || '');
          } else if (horarioGeral) {
            this.horarioInicio.set(horarioGeral);
          }

          const formatoStr = this.texto(raw['formato']).toLowerCase();
          if (formatoStr.includes('online')) {
            this.formato.set('online');
            this.cep.set('');
            this.numeroEndereco.set('');
            this.local.set('');
            this.estacao.set('');
          } else {
            if (formatoStr.includes('hibr') || formatoStr.includes('híbr')) {
              this.formato.set('hibrido');
            } else {
              this.formato.set('presencial');
            }
            this.cep.set(this.texto(raw['cep']));
            this.numeroEndereco.set(this.texto(raw['numero_endereco']));
            this.local.set(this.texto(raw['local']));
            this.estacao.set(this.texto(raw['estacao_proxima'] ?? raw['estacao']));
          }

          this.linkInscricao.set(this.texto(raw['link_inscricao'] ?? raw['inscricao']));

          if (Array.isArray(raw['publico_alvo'])) {
            this.publicosSelecionados.set(
              raw['publico_alvo'].filter((v): v is string => typeof v === 'string'),
            );
          }
          if (Array.isArray(raw['selos'])) {
            this.selosSelecionados.set(
              raw['selos'].filter((v): v is string => typeof v === 'string'),
            );
          }
        },
        error: (err: unknown) => {
          console.error('Erro ao carregar evento para edição:', err);
          this.erro.set('Não foi possível carregar os dados do evento.');
        },
      });
  }

  private rotuloFormato(fmt: FormatoEvento): string {
    if (fmt === 'online') return 'Online';
    if (fmt === 'hibrido') return 'Híbrido';
    return 'Presencial';
  }

  private normalizarDataParaBanco(valor: string): string {
    const data = this.parseData(valor);
    if (!data) return valor;
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
  }

  private parseData(valor: unknown): Date | null {
    if (valor instanceof Date) {
      return Number.isNaN(valor.getTime()) ? null : valor;
    }
    if (typeof valor === 'string') {
      const limpo = valor.trim();
      const br = limpo.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
      if (br) {
        return new Date(Number(br[3]), Number(br[2]) - 1, Number(br[1]));
      }
      const iso = limpo.match(/^(\d{4})-(\d{2})-(\d{2})$/);
      if (iso) {
        return new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));
      }
      const d = new Date(limpo);
      return Number.isNaN(d.getTime()) ? null : d;
    }
    if (valor && typeof valor === 'object' && 'toDate' in valor && typeof valor.toDate === 'function') {
      const d = valor.toDate();
      return d instanceof Date && !Number.isNaN(d.getTime()) ? d : null;
    }
    return null;
  }

  private linkValido(url: string): boolean {
    const limpo = url.trim();
    if (!limpo) return false;
    try {
      const parsed = new URL(limpo);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  }

  private texto(valor: unknown): string {
    return typeof valor === 'string' ? valor : '';
  }
}