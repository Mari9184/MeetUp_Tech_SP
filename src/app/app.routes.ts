
import { Routes } from '@angular/router';
import { DetalhesEvento } from './pages/detalhes-evento/detalhes-evento';

export const routes: Routes = [
  {
    path: 'admin/administradores',
    title: 'Administradores · MEET_UP_TECH_SP',
    loadComponent: () =>
      import('./pages/painel-administradores/painel-administradores.component').then(
        (m) => m.PainelAdministradoresComponent,
      ),
  },
  {
    path: 'admin',
    redirectTo: 'admin/administradores',
    pathMatch: 'full',
  },
  {
    path: 'eventos/:id',
    component: DetalhesEvento
  },
  {
    path: '',
    redirectTo: 'eventos/1',
    pathMatch: 'full'
  }
];
