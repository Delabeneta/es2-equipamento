export enum FuncionarioFuncao {
  REPARADOR = 'REPARADOR',
  ADMINISTRADOR = 'ADMINISTRADOR',
}

export default class Funcionario {
  matricula: string;
  nome: string;
  idade: number;
  email: string;
  cpf: string;
  funcao: FuncionarioFuncao;
}
