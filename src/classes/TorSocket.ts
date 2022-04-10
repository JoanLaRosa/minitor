// import {
//   SocksClient,
//   SocksClientOptions,
//   SocksClientChainOptions,
// } from "socks";
// https://www.npmjs.com/package/socks
import * as struct from "python-struct";

import { CommandTypes } from "../constants";
import Cell from "./Cell";
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

  sendCell(cell: Cell) {
    this._socket.write(cell.getBytes(this.getMaxProtocolVersion()));
  }

  retrieveCell(ignoreResponse?: boolean) {
    let circuitId = 0;
    if (this.getMaxProtocolVersion() < 4) {
      circuitId = Number(
        struct.unpack("!H", this._socket.read(2))[0].valueOf()
      );
    } else {
      circuitId = Number(
        struct.unpack("!I", this._socket.read(4))[0].valueOf()
      );
    }
    const command = struct.unpack("!B", this._socket.read(1))[0].valueOf();
    let payload = "";
    // if (
    // return;
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
    while (true) {
      const cell = new RelayCell({ cell: this.retrieveCell() });
      if (cell.command === CommandTypes.RELAY) {
        cell.payload = circuit.decrypt(cell.payload);
        const parsedResponse = cell.parseCell();
        if (parsedResponse.command === CommandTypes.RELAY_DATA) {
          const data_length = parsedResponse.length;
          response += parsedResponse.data.slice(0, data_length);
          if (parsedResponse.data.length < RelayCell.MAX_RELAY_SIZE) {
            break;
          }
        }
      }
    }
    return response;
  }

  private sendNetInfo() {
    const cell = new Cell(0, CommandTypes.NETINFO, {
      timestamp: new Date().toISOString(),
      otherIp: this.guardRelay.ip,
      ourIp: this._ourPublicIp,
    });
    this.sendCell(cell);
  }
}

export default TorSocket;
