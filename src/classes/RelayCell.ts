import Cell from "./classes/Cell";
import OnionRouter from "./OnionRouter";

interface RelayCell {
  cell: Cell;
}

class RelayCell extends Cell {
  constructor({ cell }: { cell: Cell }) {
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
