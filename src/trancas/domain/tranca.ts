export enum TrancaStatus {
  NOVA = 'NOVA',
  LIVRE = 'LIVRE',
  OCUPADA = 'OCUPADA',
  EM_REPARO = 'EM_REPARO',
  APOSENTADA = 'APOSENTADA',
  EXCLUIDA = 'EXCLUIDA',
}

export class Tranca {
  id: number;
  bicicleta: number;
  numero: number;
  localizacao: string;
  status: TrancaStatus;
  modelo: string;
  anoDeFabricacao: string;
}

export class TrancaPersistence extends Tranca {
  bicicletaId: number;
}
