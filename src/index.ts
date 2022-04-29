import Consensus from './classes/Consensus';
import TorSocket from './classes/TorSocket';
import OnionRouter from './classes/OnionRouter';
import Circuit from './classes/Circuit';

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
    let guardRelay: OnionRouter | undefined;
    while (!guardRelay) {
      try {
        guardRelay = this._consensus.getRandomGuardRelay();
      } catch (error) {
        continue;
      }
    }
    const torSocket = new TorSocket({ guardRelay });
    torSocket.connect();

    // const circuit = new Circuit({ torSocket });
    // circuit.create(guardRelay);

    // const extendRelay = this._consensus.getRandomOnionRouter();
    // circuit.extend(extendRelay);
  }
}

export default MiniTor;
