interface OnionRouter {
  nickname: string;
  ip: string;
  dirPort: number;
  torPort: number;
  identity: string;
  flags?: string[];
  forwardDigest: any;
  backwardDigest: any;
  encryptionKey: any;
  decryptionKey: any;
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
  }

  getDescriptorUrl() {
    return `http://${this.ip}:${this.dirPort}/tor/server/fp/${this.identity}`;
  }

  parseDescriptor() {
    return;
  }

  getSharedSecret() {
    return;
  }

  encrypt() {
    return;
  }

  decrypt() {
    return;
  }
}

export default OnionRouter;
