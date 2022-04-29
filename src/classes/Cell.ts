import * as struct from 'python-struct';

import { CommandTypes } from '../constants';

const CELL_SIZE = 514;
const MAX_PAYLOAD_SIZE = 509;

type Payload1 = {
  type?: number;
  length?: string;
  data?: string;
};
type Payload2 = {
  encryptedPayload?: string;
};

type Payload3 = {
  versions?: [string];
};

type Payload4 = {
  timestamp?: string;
  otherIp?: string;
  ourIp?: string;
};

// FIXME: Change Payload type to Payload1 | Payload2 | Payload3 | Payload4
export type Payload = Payload1 | Payload2 | Payload3 | Payload4;

interface Cell {
  circuitId: number;
  command: number;
  payload: Payload;
}

class Cell {
  constructor(circuitId: number, command: number, payload: Payload) {
    this.circuitId = circuitId;
    this.command = command;
    this.payload = payload;
  }

  // FIXME: change Int8Array to the bytes struct
  getBytes(maxProtocolVersion: number): string {
    let payloadBytes = '';

    if (this.command == CommandTypes.VERSIONS) {
      payloadBytes = struct
        .pack(
          '!' + 'H'.repeat(this.payload.versions.length),
          this.payload.versions
        )
        .toString();
    } else if (this.command == CommandTypes.NETINFO) {
      const timestamp = struct.pack('!I', this.payload.timestamp);
      const other_or_address = '';
      //FIXME: const other_or_address =  struct.pack("!BB", 4, 4) + socket.inet_aton(this.payload["other_ip"]);
      const number_of_addresses = struct.pack('!B', 1);
      const this_or_address = '';
      // FIXME: const this_or_address = struct.pack("!BB", 4, 4) + socket.inet_aton(this.payload["our_ip"]);
      payloadBytes =
        timestamp + other_or_address + number_of_addresses + this_or_address;
    } else if (this.command == CommandTypes.CREATE2) {
      payloadBytes =
        struct.pack('!HH', this.payload.type, this.payload.length) +
        this.payload.data;
    } else if (this.command in [CommandTypes.RELAY_EARLY, CommandTypes.RELAY]) {
      payloadBytes = this.payload.encryptedPayload;
    } else {
      // log.error("Invalid payload format for command: " + str(this.command))
    }

    if (this.isVariableLengthCommand(this.command)) {
      let header = '';
      if (maxProtocolVersion < 4) {
        header = struct
          .pack('!HBH', this.circuitId, this.command, payloadBytes.length)
          .toString();
      } else {
        // Link protocol 4 increases circuit ID width to 4 bytes.
        header = struct
          .pack('!IBH', this.circuitId, this.command, payloadBytes.length)
          .toString();
      }
      return header + payloadBytes;
    } else {
      // This is a fixed-length cell.
      if (maxProtocolVersion < 4) {
        payloadBytes = struct
          .pack('!HB509s', this.circuitId, this.command, payloadBytes)
          .toString();
      } else {
        // Link protocol 4 increases circuit ID width to 4 bytes.
        payloadBytes = struct
          .pack('!IB509s', this.circuitId, this.command, payloadBytes)
          .toString();
      }
      return payloadBytes;
    }
  }

  isVariableLengthCommand(command: number): boolean {
    return command == CommandTypes.VERSIONS || command >= 128;
  }
}

export default Cell;
export { MAX_PAYLOAD_SIZE, CELL_SIZE };
