import { Routes } from '@angular/router';
import { PaginaInicial } from './pages/pagina-inicial/pagina-inicial';
import { Login } from './pages/login/login';
import { PaginaEvento } from './pages/pagina-evento/pagina-evento';
import { PaginaEventosAdm } from './pages/pagina-eventos-adm/pagina-eventos-adm';
import { CadastrandoEventoAdm } from './pages/cadastrando-evento-adm/cadastrando-evento-adm';
import { IrEmGrupoAdms } from './pages/ir-em-grupo-adms/ir-em-grupo-adms';
import { CadastroDeAdms } from './pages/cadastro-de-adms/cadastro-de-adms';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: PaginaInicial },
  { path: 'login', component: Login, title: 'Área administrativa | Meetup Tech SP' },
  { path: 'evento', component: PaginaEvento, title: 'Área Evento' },
  { path: 'eventos', component: PaginaEventosAdm, title: 'Área administrativa | Eventos', canActivate: [authGuard] },
  {
    path: 'cadastrando-evento-adm',
    component: CadastrandoEventoAdm,
    title: 'Cadastrar evento | Área administrativa',
    canActivate: [authGuard],
  },
  {
    path: 'ir-em-grupo-adms',
    component: IrEmGrupoAdms,
    title: 'Participantes | Área administrativa',
    canActivate: [authGuard],
  },
  {
    path: 'cadastro-adms',
    component: CadastroDeAdms,
    title: 'Cadastro de ADMs | Área administrativa',
    canActivate: [authGuard],
  },
];
