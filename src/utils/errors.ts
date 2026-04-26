export class MangoValidationError extends Error {
  constructor() {
    super('NOT_A_MANGO');
    this.name = 'MangoValidationError';
  }
}
