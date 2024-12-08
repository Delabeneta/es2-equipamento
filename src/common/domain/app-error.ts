export enum AppErrorType {
  RESOURCE_NOT_FOUND,
  RESOURCE_CONFLICT,
}

export class AppError {
  constructor(
    readonly message: string,
    readonly type: AppErrorType,
  ) {}
}
