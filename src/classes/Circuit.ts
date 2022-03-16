interface Circuit {
  torSocket: any;
  circuitId: number;
  onionRouters: any;
}

class Circuit {
  constructor(torSocket: any) {
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
