
import { Routes } from '@angular/router';
import { DetalhesEvento } from './pages/detalhes-evento/detalhes-evento';

export const routes: Routes = [
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
