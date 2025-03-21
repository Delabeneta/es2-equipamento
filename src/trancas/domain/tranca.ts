export enum TrancaStatus {
  NOVA = 'NOVA',
  LIVRE = 'LIVRE',
  OCUPADA = 'OCUPADA',
  EM_REPARO = 'EM_REPARO',
  APOSENTADA = 'APOSENTADA',
  EXCLUIDA = 'EXCLUIDA',
  REPARO_SOLICITADO = 'REPARO_SOLICITADO',
}

export class Tranca {
  id: number;
  bicicleta: number;
  numero: number;
  modelo: string;
  localizacao: string;
  anoDeFabricacao: string;
  status: TrancaStatus;
  funcionarioId?: number;
}

export class TrancaPersistence extends Tranca {
  bicicletaId: number;
}
