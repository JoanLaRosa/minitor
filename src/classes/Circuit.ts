import { CommandTypes, RelayCommand } from "../constants";
import { Payload } from "./Cell";

import Cell from "./Cell";
import RelayCell from "./RelayCell";
import TorSocket from "./TorSocket";

import * as struct from "python-struct";

interface Circuit {
  torSocket: any; // FIXME update to TorSocket type
  circuitId: number;
  onionRouters: [any?];
  streamId: number;
}

class Circuit {
  constructor({ torSocket }: { torSocket: TorSocket }) {
    this.torSocket = torSocket;
    this.circuitId = 0;
    this.onionRouters = [];
    this.streamId = 0;
  }

  create(guardRelay) {
    //FIXME make KeyAgreementNTOR class
    let keyAgreement: any; // key_agreement = KeyAgreementNTOR(guard_relay);
    const payload: Payload = {
      type: 2,
      length: keyAgreement.getOnionSkin().length,
      data: keyAgreement.getOnionSkin(),
    };
    this.torSocket.sendCell(
      new Cell(this.circuitId, CommandTypes.CREATE2, payload)
    );
    const cell = this.torSocket.retrieveCell();

    if (cell.command != CommandTypes.CREATED2) {
      // log.error("Received command is not a CREATED2.");
      throw new Error("Received command is not a CREATED2.");
    }
    keyAgreement.complete_handshake(cell.payload["Y"], cell.payload["auth"]);
    this.onionRouters.push(guardRelay);

    return;
  }

  createRelayCell(command, streamId, payload) {
    let relayCell: string = struct.pack("!B", command).toString();
    relayCell += struct.pack("!H", 0);
    // Rather, RELAY cells that affect the
    // entire circuit rather than a particular stream use a StreamID of zero
    relayCell += struct.pack("!H", streamId);
    // FIXME: relay_cell += struct.pack("!4s", "\x00" * 4)
    relayCell += struct.pack("!H", payload.length);
    relayCell += struct.pack("!498s", payload);

    // Calculate and replace the digest.
    const calculatedDigest = this.onionRouters[this.onionRouters.length - 1]
      .getForwardDigest(relayCell)
      .slice(0, 4);
    relayCell = relayCell.slice(0, 5) + calculatedDigest + relayCell.slice(9);

    // Encrypt the relay cell to the last onion router in the circuit.
    relayCell = this.encryptPayload(relayCell);
    return relayCell;
  }

  startStream(address, port) {
    this.streamId += 1;
    // log.debug("Starting a stream with stream id: " + str(self._stream_id))

    // The payload format is:
    // ADDRPORT[nul - terminated string]
    // FLAGS[4 bytes]
    // ADDRPORT is made of ADDRESS | ':' | PORT | [00]
    let relayPayload = `${address}:${port}`;
    relayPayload += struct.pack("!BI", 0, 0);
    const relayCell = this.createRelayCell(
      RelayCommand.RELAY_BEGIN,
      this.streamId,
      relayPayload
    );
    this.torSocket.sendCell(
      new Cell(this.circuitId, CommandTypes.RELAY, {
        encryptedPayload: relayCell,
      })
    );
    const responseCell = new RelayCell(this.torSocket.retrieveCell());
    responseCell.payload = this.decryptPayload(responseCell.payload);
    const parsedResponse = responseCell.parseCell();
    if (parsedResponse.command !== RelayCommand.RELAY_CONNECTED) {
      // log.error("Creating a connection to the address failed.")
      throw new Error("Creating a connection to the address failed.");
    }
  }

  sendHttpGet() {
    const relayPayload = "GET / HTTP/1.0\r\n\r\n";
    const relayCell = this.createRelayCell(
      RelayCommand.RELAY_DATA,
      this.streamId,
      relayPayload
    );
    this.torSocket.sendCell(
      new Cell(this.circuitId, CommandTypes.RELAY, {
        encryptedPayload: relayCell,
      })
    );
    const responseData = this.torSocket.retrieveRelayData(self);
    return responseData;
  }

  extend(onionRouter) {
    // log.debug("Extending the circuit to \"%s\"...", onion_router.nickname)
    // const key_agreement = KeyAgreementNTOR(onionRouter);
    let keyAgreement: any; // FIXME make KeyAgreementNTOR class

    let relayPayload = struct.pack("!B", 2);
    // FIXME:
    // relay_payload += struct.pack(
    //   "!BB4sH",
    //   0,
    //   6,
    //   socket.inet_aton(onion_router.ip),
    //   onion_router.tor_port
    // );
    // relay_payload += struct.pack(
    //   "!BB20s",
    //   2,
    //   20,
    //   b16decode(onion_router.identity.encode())
    // );
    relayPayload +=
      struct.pack("!HH", 2, keyAgreement.getOnionSkin().length) +
      keyAgreement.getOnionSkin();

    const relayCell = this.createRelayCell(
      RelayCommand.RELAY_EXTEND2,
      0,
      relayPayload
    );

    // When speaking v2 of the link protocol or later, clients MUST only send
    // EXTEND2 cells inside RELAY_EARLY cells.
    this.torSocket.sendCell(
      new Cell(this.circuitId, CommandTypes.RELAY_EARLY, {
        encryptedPayload: relayCell,
      })
    );

    const responseCell = new RelayCell(this.torSocket.retrieveCell());
    if (responseCell.command != CommandTypes.RELAY) {
      // log.error("Received command is not a RELAY.")
      throw new Error("Received command is not a RELAY.");
    }
    responseCell.payload = this.decryptPayload(responseCell.payload);
    const parsedResponse = responseCell.parseCell();

    keyAgreement.completeHandshake(parsedResponse["Y"], parsedResponse["auth"]);
    this.onionRouters.push(onionRouter);
  }

  encryptPayload(relayPayload) {
    this.onionRouters.reverse().forEach((router) => {
      relayPayload = router.encrypt(relayPayload);
    });
    return relayPayload;
  }

  decryptPayload(relayPayload): Payload {
    this.onionRouters.forEach((router) => {
      relayPayload = router.decrypt(relayPayload);
      // if 'recognized' = ZERO then probability is high that the relay cell was decrypted
      if (relayPayload.slice(1, 3) == "\x00\x00") {
        const digest = router.getBackwardDigest(relayPayload).slice(0, 4);
        // check that also the digest is correct
        if (relayPayload.slice(5, 9) == digest) {
          return relayPayload;
        }
      }
    });
    // FIXME Error out here? or return empty
    throw new Error("(Potentially incorrect throw) Failure Decrypting Payload");
  }
}

export default Circuit;
