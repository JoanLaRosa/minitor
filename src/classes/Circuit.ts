import { CommandTypes } from "../constants";
import { Payload } from "./Cell";

import Cell from "./Cell";
import RelayCell from "./RelayCell";
import TorSocket from "./TorSocket";

import struct = require("python-struct");

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

  create(guard_relay) {
    //FIXME make KeyAgreementNTOR class
    let key_agreement: any; // key_agreement = KeyAgreementNTOR(guard_relay);
    const payload: Payload = {
      type: 2,
      length: key_agreement.get_onion_skin().length,
      data: key_agreement.get_onion_skin(),
    };
    this.torSocket.sendCell(
      new Cell(this.circuitId, CommandTypes.CREATE2, payload)
    );
    const cell = this.torSocket.retrieveCell();

    if (cell.command != CommandTypes.CREATED2) {
      // log.error("Received command is not a CREATED2.");
      throw new Error("Received command is not a CREATED2.");
    }
    key_agreement.complete_handshake(cell.payload["Y"], cell.payload["auth"]);
    this.onionRouters.push(guard_relay);

    return;
  }

  createRelayCell(command, stream_id, payload) {
    let relayCell: string = struct.pack("!B", command);
    relayCell += struct.pack("!H", 0);
    // Rather, RELAY cells that affect the
    // entire circuit rather than a particular stream use a StreamID of zero
    relayCell += struct.pack("!H", stream_id);
    // FIXME: relay_cell += struct.pack("!4s", "\x00" * 4)
    relayCell += struct.pack("!H", payload.length);
    relayCell += struct.pack("!498s", payload);

    // Calculate and replace the digest.
    const calculated_digest = this.onionRouters[-1]
      .getForwardDigest(relayCell)
      .slice(0, 4);
    relayCell = relayCell.slice(0, 5) + calculated_digest + relayCell.slice(9);

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
    let relay_payload = `${address}:${port}`;
    relay_payload += struct.pack("!BI", 0, 0);
    const relay_cell = this.createRelayCell(
      CommandTypes.RELAY_BEGIN,
      this.streamId,
      relay_payload
    );
    this.torSocket.send_cell(
      new Cell(this.circuitId, CommandTypes.RELAY, {
        encrypted_payload: relay_cell,
      })
    );
    const response_cell = new RelayCell(this.torSocket.retrieveCell());
    response_cell.payload = this.decryptPayload(response_cell.payload);
    const parsed_response = response_cell.parseCell();
    if (parsed_response["command"] != CommandTypes.RELAY_CONNECTED) {
      // log.error("Creating a connection to the address failed.")
      throw new Error("Creating a connection to the address failed.");
    }
  }

  sendHttpGet() {
    const relay_payload = "GET / HTTP/1.0\r\n\r\n";
    const relay_cell = this.createRelayCell(
      CommandTypes.RELAY_DATA,
      this.streamId,
      relay_payload
    );
    this.torSocket.send_cell(
      new Cell(this.circuitId, CommandTypes.RELAY, {
        encrypted_payload: relay_cell,
      })
    );
    const response_data = this.torSocket.retrieve_relay_data(self);
    return response_data;
  }

  extend(onionRouter) {
    // log.debug("Extending the circuit to \"%s\"...", onion_router.nickname)
    // const key_agreement = KeyAgreementNTOR(onionRouter);
    let key_agreement: any; // FIXME make KeyAgreementNTOR class

    let relay_payload = struct.pack("!B", 2);
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
    relay_payload +=
      struct.pack("!HH", 2, key_agreement.get_onion_skin().length) +
      key_agreement.get_onion_skin();

    const relay_cell = this.createRelayCell(
      CommandTypes.RELAY_EXTEND2,
      0,
      relay_payload
    );

    // When speaking v2 of the link protocol or later, clients MUST only send
    // EXTEND2 cells inside RELAY_EARLY cells.
    this.torSocket.send_cell(
      new Cell(this.circuitId, CommandTypes.RELAY_EARLY, {
        encrypted_payload: relay_cell,
      })
    );

    const response_cell = new RelayCell(this.torSocket.retrieveCell());
    if (response_cell.command != CommandTypes.RELAY) {
      // log.error("Received command is not a RELAY.")
      throw new Error("Received command is not a RELAY.");
    }
    response_cell.payload = this.decryptPayload(response_cell.payload);
    const parsed_response = response_cell.parseCell();

    key_agreement.complete_handshake(
      parsed_response["Y"],
      parsed_response["auth"]
    );
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
        const digest = router.get_backward_digest(relayPayload).slice(0, 4);
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
