
import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-detalhes-evento',
  imports: [],
  templateUrl: './detalhes-evento.html',
  styleUrl: './detalhes-evento.css',
})
export class DetalhesEvento {

  
participantes = signal<string[]>(this.carregarParticipantes());

private carregarParticipantes(): string[] {
  const dadosSalvos = localStorage.getItem('meetup-participantes-1');

  if (dadosSalvos) {
    try {
      const nomes = JSON.parse(dadosSalvos);

      if (
        Array.isArray(nomes) &&
        nomes.every(nome => typeof nome === 'string')
      ) {
        return nomes;
      }
    } catch {
      // Se os dados estiverem inválidos, usamos a lista inicial.
    }
  }

  return [
    'Ariel N.',
    'Bruno R.',
    'Gabriel T.',
    'Mariane S.',
    'Miguel A.'
  ];
}


  formularioAberto = signal(false);

nomeDigitado = signal('');


adicionarParticipante(): void {
  const nome = this.nomeDigitado().trim();

  if (!nome) {
    return;
  }

  this.participantes.update(lista => [...lista, nome]);

  localStorage.setItem(
    'meetup-participantes-1',
    JSON.stringify(this.participantes())
  );

  this.nomeDigitado.set('');
  this.fecharFormulario();
}



  abrirFormulario(): void {
    this.formularioAberto.set(true);
  }

  fecharFormulario(): void {
    this.formularioAberto.set(false);
  }

}
