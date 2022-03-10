import Cell from "./cell";
import OnionRouter from "./onionRouter";

interface RelayCell {
  cell: Cell;
}

class RelayCell extends Cell {
  constructor({ cell }: RelayCell) {
    super(cell);
  }

  decrypt(onionRouters: OnionRouter[]) {
    for (const router of onionRouters.reverse()) {
      this.payload = router.decrypt(this.payload);
    }
  }

  parseCell() {
    return;
  }
}

export default RelayCell;
