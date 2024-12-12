export enum AppErrorType {
  RESOURCE_NOT_FOUND,
  RESOURCE_CONFLICT,
}

export class AppError extends Error {
  constructor(
    readonly message: string,
    readonly type: AppErrorType,
  ) {
    super();
  }
}
