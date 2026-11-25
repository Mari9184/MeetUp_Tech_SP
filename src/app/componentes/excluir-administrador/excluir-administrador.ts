import { Component, input, output } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-excluir-administrador',
  styleUrl: './excluir-administrador.css',
  templateUrl: './excluir-administrador.html',
})
export class ExcluirAdministrador {
  titulo = input('Excluir administrador');
  pergunta = input('Tem certeza de que deseja remover o acesso desta pessoa?');
  nome = input('');
  email = input('');
  aviso = input(
    'Esta pessoa perderá o acesso ao painel. Os eventos que ela cadastrou serão mantidos.',
  );
  textoBotaoConfirmar = input('Excluir administrador');
  textoBotaoExcluindo = input('Excluindo...');
  excluindo = input(false);
  erroServidor = input('');

  cancelar = output<void>();
  confirmar = output<void>();
}