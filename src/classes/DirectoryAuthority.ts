interface DirectoryAuthority {
  name: string;
  ip: string;
  dirPort: number;
  torPort: number;
}

class DirectoryAuthority {
  constructor(name: string, ip: string, dirPort: number, torPort: number) {
    this.name = name;
    this.ip = ip;
    this.dirPort = dirPort;
    this.torPort = torPort;
  }

  getConcensusUrl() {
    return `http://${this.ip}:${this.dirPort}/tor/status-vote/current/consensus`;
  }
}

export default DirectoryAuthority;
