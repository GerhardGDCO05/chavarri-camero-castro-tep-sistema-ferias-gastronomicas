export class Response {
  data: unknown;
  message: string;
  status: number;
  constructor(data?: unknown, message?: string, status?: number) {
    if (data !== undefined) this.data = data;
    else this.data = null;
    if (message !== undefined) this.message = message;
    if (status !== undefined) this.status = status;
  }
}
