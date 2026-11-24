/** Perfis de acesso ao painel administrativo. */
export type PerfilAdministrador = 'Fundador' | 'Administrador';

/** Administrador exibido na lista do painel. */
export interface Administrador {
  id: number;
  nome: string;
  email: string;
  perfil: PerfilAdministrador;
}

/** Dados enviados pelo modal "Novo administrador". */
export interface DadosNovoAdministrador {
  nome: string;
  email: string;
  senha: string;
}

/** Dados enviados pelo modal "Editar administrador". */
export interface DadosEdicaoAdministrador {
  nome: string;
  email: string;
}

/** Qual modal está aberto na página (ou nenhum). */
export type ModalAdministrador = 'cadastrar' | 'editar' | 'excluir' | null;
