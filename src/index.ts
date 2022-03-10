import Consensus from "./consensus";
export default class MiniTor {
  _consensus: Consensus;

  constructor() {
    this._consensus = new Consensus();
  }
}
