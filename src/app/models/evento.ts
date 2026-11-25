export interface Evento {
  documentId?: string;
  id_evento: number;
  vagas: number;
  id_administrador: string;
  tags: string[];
  publico_alvo: string[];
  participantes_grupo: string[];
  titulo?: string;
  area?: string;
  empresa?: string;
  data?: string | Date | { toDate: () => Date };
  inicio?: string;
  termino?: string;
  formato?: string;
  local?: string;
  estacao?: string;
  inscricao?: string;
  status?: string;
}
