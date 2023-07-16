export class InvalidSchemaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidSchemaError";
  }
}
