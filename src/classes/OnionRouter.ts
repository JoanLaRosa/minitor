import axios, { AxiosInstance } from "axios";
import * as Crypto from "crypto-js";

interface OnionRouter {
  nickname: string;
  ip: string;
  dirPort: number;
  torPort: number;
  identity: string;
  flags?: string[];
  keyNtor?: string;
  forwardDigest?: any;
  backwardDigest?: any;
  encryptionKey?: any;
  decryptionKey?: any;
  _httpClient: AxiosInstance;
}

class OnionRouter {
  constructor(
    nickname: string,
    ip: string,
    dirPort: number,
    torPort: number,
    identity: string
  ) {
    this.nickname = nickname;
    this.ip = ip;
    this.dirPort = dirPort;
    this.torPort = torPort;
    this.identity = identity;

    this._httpClient = axios.create({
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 Safari/537.36",
      },
    });
  }

  getDescriptorUrl() {
    return `http://${this.ip}:${this.dirPort}/tor/server/fp/${this.identity}`;
  }

  async parseDescriptor() {
    const response = await this._httpClient.get(this.getDescriptorUrl());
    for (const line of response.data.split("\n")) {
      const lineDecoded = line.decode();
      if (lineDecoded.startsWith("ntor-onion-key ")) {
        this.keyNtor = line.split("ntor-onion-key")[1].trim();
        break;
      }
    }
  }

  getSharedSecret(data: any) {
    // TODO
    // const { forwardDigest, backwardDigest, encryptionKey, decryptionKey } =
    //   struct.unpack("!20s20s16s16s", data);
    // this.forwardDigest = forwardDigest;
    // this.backwardDigest = backwardDigest;
    // this.encryptionKey = encryptionKey;
    // this.decryptionKey = decryptionKey;
  }

  getDigest(data: any) {
    // const digest = sha1()
    // digest.update(self.forward_digest)
    // digest.update(data)
    // return digest.digest()
  }

  encrypt(relayPayload: any) {
    // cipher = Cipher(AES(self.encryption_key), CTR(b'\x00' * 16), backend=default_backend()).encryptor()
    // return cipher.update(relay_payload)
    // const emptyBytes = new Uint8Array(16);
    const ciphertext = Crypto.AES.encrypt(relayPayload, this.encryptionKey, {
      mode: Crypto.mode.CTR,
    });
    return ciphertext;
  }

  decrypt(relayPayload: any) {
    const plaintext = Crypto.AES.decrypt(relayPayload, this.decryptionKey, {
      mode: Crypto.mode.CTR,
    });
    return plaintext;
  }
}

export default OnionRouter;
