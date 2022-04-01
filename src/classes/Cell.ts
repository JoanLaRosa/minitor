const CELL_SIZE = 514;
const MAX_PAYLOAD_SIZE = 509;

type Payload1 = {
  type: number;
  length: string;
  data: string;
};
type Payload2 = {
  encryptedPayload: string;
};

type Payload3 = {
  versions: [string];
};

type Payload4 = {
  timestamp: string;
  otherIp: string;
  ourIp: string;
};

export type Payload = Payload1 | Payload2 | Payload3 | Payload4;

interface Cell {
  circuitId: number;
  command: number;
  payload: Payload;
}

class Cell {
  constructor({ circuitId, command, payload }: Cell) {
    this.circuitId = circuitId;
    this.command = command;
    this.payload = payload;
  }

  // FIXME: change Int8Array to the bytes struct
  getBytes(maxProtocolVersion: number): Int8Array {
    return;
  }

  isVariableLengthCommand(command: number): bool {
    return 1;
  }
}

export default Cell;
export {MAX_PAYLOAD_SIZE, CELL_SIZE};
