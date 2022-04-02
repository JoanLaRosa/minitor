import { Payload } from './Cell';
import Cell from "./Cell"
import { CommandTypes } from '../constants';
import TorSocket from "./TorSocket";

interface Circuit {
  torSocket: any;
  circuitId: number;
  onionRouters: any;
  streamId: number;
}

class Circuit {
  constructor({ torSocket }: { torSocket: TorSocket }) {
    this.torSocket = torSocket;
    this.circuitId = 0;
    this.onionRouters = [];
    this.streamId = 0;
  }

  create(guard_relay) {
    let key_agreement: any; // key_agreement = KeyAgreementNTOR(guard_relay)
    let payload: Payload = { type: 2, length: key_agreement.get_onion_skin().length, data: key_agreement.get_onion_skin() };
    // this.torSocket.send_cell(new Cell({ circuitId: this.circuitId, command: CommandTypes.CREATE2, payload: payload }));
    return;
  }

  extend() {
    return;
  }
}

export default Circuit;
