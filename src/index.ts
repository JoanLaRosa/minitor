import Consensus from "./Consensus";
export default class MiniTor {
  _consensus: Consensus;

  constructor() {
    this._consensus = new Consensus();
  }
}
