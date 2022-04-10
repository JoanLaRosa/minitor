import * as struct from "python-struct";

import OnionRouter from "./OnionRouter";
import Cell, { MAX_PAYLOAD_SIZE } from "./Cell";
import { RelayCommand } from "../constants";
import { DynamicType } from "../types";

export const MAX_RELAY_CELL_DATA = MAX_PAYLOAD_SIZE - 11;

interface RelayCell {
  cell: Cell;
}

class RelayCell extends Cell {
  constructor({ cell }) {
    super(cell.circuitId, cell.command, cell.payload?.encryptedPayload);
  }

  // FIXME: is this function necessary?
  decrypt(onionRouters: OnionRouter[]) {
    for (const router of onionRouters.reverse()) {
      // FIXME: this.payload = router.decrypt(this.payload);
      this.payload = router.decrypt("0");
    }
  }

  parseCell(): any {
    const pyl: string = this.payload.encryptedPayload;
    const relayCommand = Number(
      struct.unpack("!B", pyl.slice(0, 1))[0].valueOf()
    );
    const recognized = struct.unpack("!H", pyl.slice(1, 3))[0].valueOf();
    const streamId = struct.unpack("!H", pyl.slice(3, 5))[0].valueOf();
    const digest: string = struct.unpack("!4s", pyl.slice(5, 9))[0].toString();
    const length = struct.unpack("!H", pyl.slice(9, 11))[0].valueOf();
    let data = struct.unpack("!498s", pyl.slice(11))[0].toString();

    const responseData: DynamicType = {
      command: relayCommand,
      recognized: recognized,
      streamId: streamId,
      digest: digest,
      length: length,
      data: data,
    };
    if (relayCommand == RelayCommand.RELAY_EXTENDED2) {
      const dataLength = Number(
        struct.unpack("!H", data.slice(0, 2))[0].valueOf()
      );
      data = data.slice(2, dataLength + 2);
      const y = data.slice(0, 32);
      const auth = data.slice(32);

      responseData.Y = y;
      responseData.auth = auth;
    } else if (
      [
        RelayCommand.RELAY_DATA,
        RelayCommand.RELAY_CONNECTED,
        RelayCommand.RELAY_END,
      ].includes(relayCommand)
    ) {
      // Do nothing
    } else {
      // console.log("Unsupported relay cell: %d", relay_command);
    }

    return responseData;
  }
}

export default RelayCell;
