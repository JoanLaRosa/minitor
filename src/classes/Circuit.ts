import TorSocket from "./TorSocket";

interface Circuit {
  torSocket: any;
  circuitId: number;
  onionRouters: any;
}

class Circuit {
  constructor({ torSocket }: { torSocket: TorSocket }) {
    this.torSocket = torSocket;
    this.circuitId = 0;
    this.onionRouters = [];
  }

  create() {
    return;
  }

  extend() {
    return;
  }
}

export default Circuit;
