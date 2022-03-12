import OnionRouter from "./OnionRouter";

interface TorSocket {
  guardRelay: OnionRouter;
}

class TorSocket {
  constructor({ guardRelay }: TorSocket) {
    this.guardRelay = guardRelay;
  }

  getMaxProtocolVersion() {
    return;
  }

  connect() {
    return;
  }

  sendCell() {
    return;
  }

  retrieveCell() {
    return;
  }

  sendVersions() {
    return;
  }

  retrieveVersions() {
    return;
  }

  retriveCerts() {
    return;
  }

  retriveNetInfo() {
    return;
  }

  sendNetInfo() {
    return;
  }
}

export default TorSocket;
