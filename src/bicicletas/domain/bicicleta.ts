export enum BicicletaStatus {
  NOVA = 'NOVA',
  DISPONIVEL = 'DISPONIVEL',
  EM_USO = 'EM_USO',
  EM_REPARO = 'EM_REPARO',
  REPARO_SOLICITADO = 'REPARO_SOLICITADO',
  APOSENTADA = 'APOSENTADA',
  EXCLUIDA = 'EXCLUIDA',
}

export class Bicicleta {
  id: number;
  marca: string;
  modelo: string;
  ano: string;
  numero: number;
  status: BicicletaStatus;
}

export class BicicletaPersistence extends Bicicleta {
  trancaId: number;
}
