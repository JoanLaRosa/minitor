import Cell from "./Cell";
import OnionRouter from "./OnionRouter";

import { MAX_PAYLOAD_SIZE } from "./Cell";
import { CommandTypes } from "../constants";
import { DynamicType } from "../types";
import struct = require("python-struct");

export const MAX_RELAY_CELL_DATA = MAX_PAYLOAD_SIZE - 11;

interface RelayCell {
  cell: Cell;
}

class RelayCell extends Cell {
  constructor(cell: Cell) {
    super(cell.circuitId, cell.command, cell.payload.encryptedPayload);
  }

  decrypt(onionRouters: OnionRouter[]) {
    for (const router of onionRouters.reverse()) {
      this.payload = router.decrypt(this.payload);
    }
  }

  parseCell(): any {
    const pyl: string = this.payload.encryptedPayload;
    const relay_command: string = struct.unpack("!B", pyl.slice(0, 1))[0];
    const recognized: number = struct.unpack("!H", pyl.slice(1, 3))[0];
    const stream_id: number = struct.unpack("!H", pyl.slice(3, 5))[0];
    const digest: string = struct.unpack("!4s", pyl.slice(5, 9))[0];
    const length = struct.unpack("!H", pyl.slice(9, 11))[0];
    let data = struct.unpack("!498s", pyl.slice(11))[0];

    const response_data: DynamicType = {
      command: relay_command,
      recognized: recognized,
      stream_id: stream_id,
      digest: digest,
      length: length,
      data: data,
    };
    if (+relay_command == CommandTypes.RELAY_EXTENDED2) {
      const data_length = struct.unpack("!H", data.slice(0, 2))[0];
      data = data.slice(2, data_length + 2);
      const y = data.slice(0, 32);
      const auth = data.slice(32);

      response_data.Y = y;
      response_data.auth = auth;
    } else if (
      relay_command in
      [
        CommandTypes.RELAY_DATA,
        CommandTypes.RELAY_CONNECTED,
        CommandTypes.RELAY_END,
      ]
    ) {
      // Do nothing
    } else {
      console.log("Unsupported relay cell: %d", relay_command);
    }

    return response_data;
  }
}

export default RelayCell;
