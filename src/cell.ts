const CELL_SIZE = 514;
const MAX_PAYLOAD_SIZE = 509;

type Payload1 = {
  type: string;
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

type Payload = Payload1 | Payload2 | Payload3 | Payload4;

interface Consensus {
  circuitId: number;
  command: number;
  payload: Payload;
}

class Consensus {
  constructor({ circuitId, command, payload }: Consensus) {
    this.circuitId = circuitId;
    this.command = command;
    this.payload = payload;
  }
  // FIXME: change Int8Array to the bytes struct
  getBytes(maxProtocolVersion: number): Int8Array {
    return;
  }

  isVariableLengthCommand(command: number): bool {
    return;
  }
}

export default Consensus;
