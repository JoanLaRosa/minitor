interface OnionRouter {
  nickname: string;
  ip: string;
  dirPort: number;
  torPort: number;
  identity: string;
}

class OnionRouter {
  constructor({ nickname, ip, dirPort, torPort, identity }: OnionRouter) {
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
