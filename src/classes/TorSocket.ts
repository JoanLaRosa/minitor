// import {
//   SocksClient,
//   SocksClientOptions,
//   SocksClientChainOptions,
// } from "socks";
// https://www.npmjs.com/package/socks

import { CommandTypes } from "../constants";
import Circuit from "./Circuit";
import OnionRouter from "./OnionRouter";
import RelayCell from "./RelayCell";

interface TorSocket {
  guardRelay: OnionRouter;
  _protocolVersions: number[];
  _ourPublicIp: string;
  _circuits: Circuit[];
  _socket: any;
}

class TorSocket {
  constructor({ guardRelay }: { guardRelay: OnionRouter }) {
    this.guardRelay = guardRelay;
    //   self._socket = ssl.wrap_socket(
    //     socket.socket(socket.AF_INET, socket.SOCK_STREAM),
    //     ssl_version=ssl.PROTOCOL_TLSv1_2
    // )
    // this._socket =
    this._protocolVersions = [3];
    this._ourPublicIp = "0";
    this._circuits = [];
  }

  getMaxProtocolVersion() {
    return Math.max(...this._protocolVersions);
  }

  connect() {
    this._socket.connect((this.guardRelay.ip, this.guardRelay.torPort));
    this.sendVersions();
    this.retrieveVersions();
    this.retriveCerts();
    this.retriveNetInfo();
  }

  sendCell() {
    return;
  }

  retrieveCell() {
    return;
  }

  private sendVersions() {
    return;
  }

  private retrieveVersions() {
    return;
  }

  private retriveCerts() {
    return;
  }

  private retriveNetInfo() {
    return;
  }

  retrieveRelayData(circuit: Circuit) {
    let response = "";
    // while (true) {
    //   const cell = new RelayCell({ cell: this.retrieveCell() });
    //   if (cell.command === CommandTypes.RELAY) {
    //     cell.payload = circuit.decrypt(cell.payload);
    //     const parsedResponse = cell.parseCell();
    //     if (parsedResponse.command === CommandTypes.RELAY_DATA) {
    //       const data_length = parsedResponse.length;
    //       response += parsedResponse.data.slice(0, data_length);
    //       if (parsedResponse.data.length < RelayCell.MAX_RELAY_SIZE) {
    //         break;
    //       }
    //     }
    //   }
    // }
    return response;
  }

  private sendNetInfo() {
    this.sendCell();
  }
}

export default TorSocket;
