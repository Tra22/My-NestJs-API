import { randomUUID } from 'crypto';

export class Metadata {
  constructor() {
    this.timestamp = new Date();
    this.traceId = randomUUID();
  }
  timestamp: Date;
  traceId: string;
}
