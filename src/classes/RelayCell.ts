import Cell from "./Cell";
// import OnionRouter from "./OnionRouter";
import struct = require('python-struct');

const MAX_RELAY_CELL_DATA = Cell.MAX_PAYLOAD_SIZE - 11;

interface RelayCell {
  cell: Cell;
}

class RelayCell extends Cell {
  constructor({ cell }: { cell: Cell }) {
    super(cell);
  }

  // decrypt(onionRouters: OnionRouter[]) {
  //   for (const router of onionRouters.reverse()) {
  //     this.payload = router.decrypt(this.payload);
  //   }
  // }

  parseCell() {
    // let relay_command: string = struct.unpack("!B", this.payload.slice(0, 1))[0]    let recognized: number = struct.unpack("!H", this.payload[1:][: 2])[0]
    // let stream_id: number = struct.unpack("!H", this.payload[3:][: 2])[0]
    // let digest:string = struct.unpack("!4s", this.payload[5:][: 4])[0]
    // let length = struct.unpack("!H", this.payload[9:][: 2])[0]
    // let data = struct.unpack("!498s", this.payload[11:])[0]

  }
}

export default RelayCell;
