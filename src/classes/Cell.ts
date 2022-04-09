import { DynamicType } from "../types";
import { CommandTypes } from "../constants";

import struct = require("python-struct");

const CELL_SIZE = 514;
const MAX_PAYLOAD_SIZE = 509;

// type Payload1 = {
//   type?: number;
//   length?: string;
//   data?: string;
// };
// type Payload2 = {
//   encryptedPayload?: string;
// };

// type Payload3 = {
//   versions?: [string];
// };

// type Payload4 = {
//   timestamp?: string;
//   otherIp?: string;
//   ourIp?: string;
// };

// TODO: Change Payload type to Payload1 | Payload2 | Payload3 | Payload4
export type Payload = DynamicType; //Payload1 | Payload2 | Payload3 | Payload4;

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
    let payload_bytes = "";

    if (this.command == CommandTypes.VERSIONS) {
      payload_bytes = struct.pack(
        "!" + "H".repeat(this.payload["versions"].length),
        this.payload["versions"]
      );
    } else if (this.command == CommandTypes.NETINFO) {
      const timestamp = struct.pack("!I", this.payload["timestamp"]);
      const other_or_address = "";
      // const other_or_address =  struct.pack("!BB", 4, 4) + socket.inet_aton(this.payload["other_ip"]);
      const number_of_addresses = struct.pack("!B", 1);
      const this_or_address = "";
      // const this_or_address = struct.pack("!BB", 4, 4) + socket.inet_aton(this.payload["our_ip"]);
      payload_bytes =
        timestamp + other_or_address + number_of_addresses + this_or_address;
    } else if (this.command == CommandTypes.CREATE2) {
      payload_bytes =
        struct.pack("!HH", this.payload["type"], this.payload["length"]) +
        this.payload["data"];
    } else if (this.command in [CommandTypes.RELAY_EARLY, CommandTypes.RELAY]) {
      payload_bytes = this.payload["encrypted_payload"];
    } else {
      // log.error("Invalid payload format for command: " + str(this.command))
    }

    if (this.isVariableLengthCommand(this.command)) {
      let header = "";
      if (maxProtocolVersion < 4) {
        header = struct.pack(
          "!HBH",
          this.circuitId,
          this.command,
          payload_bytes.length
        );
      } else {
        // Link protocol 4 increases circuit ID width to 4 bytes.
        header = struct.pack(
          "!IBH",
          this.circuitId,
          this.command,
          payload_bytes.length
        );
      }
      return header + payload_bytes;
    } else {
      // This is a fixed-length cell.
      if (maxProtocolVersion < 4) {
        payload_bytes = struct.pack(
          "!HB509s",
          this.circuitId,
          this.command,
          payload_bytes
        );
      } else {
        // Link protocol 4 increases circuit ID width to 4 bytes.
        payload_bytes = struct.pack(
          "!IB509s",
          this.circuitId,
          this.command,
          payload_bytes
        );
      }
      return payload_bytes;
    }
  }

  isVariableLengthCommand(command: number): boolean {
    if (command == CommandTypes.VERSIONS || command >= 128) {
      return true;
    } else {
      return false;
    }
  }
}

export default Cell;
export { MAX_PAYLOAD_SIZE, CELL_SIZE };
