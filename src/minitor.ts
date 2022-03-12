import Consensus from "./consensus";
import TorSocket from "./torSocket";

interface MiniTor {
  _consensus: Consensus;
}

class MiniTor {
  constructor() {
    this._consensus = new Consensus();

    let notFound = true;
    while (notFound) {
      const directoryAuthority = this._consensus.getRandomDirectoryAuthority();
      const consensusUrl = directoryAuthority.getConcensusUrl();
      this._consensus.parseConsensus(consensusUrl);
      notFound = false;
    }
  }

  get() {
    let notFound = true;
    while (notFound) {
      const guardRelay = this._consensus.getRandomGuardRelay();
      guardRelay.notFound = false;
    }

    const torSocket = new TorSocket({ guardRelay });
    torSocket.connect();
  }
}

export default MiniTor;
