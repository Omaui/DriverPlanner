export interface Corrida {
  id: string;
  cliente: string;
  diasSemana: number[];
  horario: string;
  recorrente: boolean;
  notificacoesIds?: string[];
}
