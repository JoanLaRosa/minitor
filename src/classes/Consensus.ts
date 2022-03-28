import axios, { AxiosInstance } from "axios";

import DirectoryAuthority from "./DirectoryAuthority";
import OnionRouter from "./OnionRouter";

interface Consensus {
  _directoryAuthorities: DirectoryAuthority[];
  _parsedConsensus: OnionRouter[];
  _httpClient: AxiosInstance;
}

class Consensus {
  constructor() {
    // Taken from https://consensus-health.torproject.org/
    this._directoryAuthorities = [
      new DirectoryAuthority("maatuska", "171.25.193.9", 443, 80),
      new DirectoryAuthority("tor26", "86.59.21.38", 80, 443),
      new DirectoryAuthority("longclaw", "199.58.81.140", 80, 443),
      new DirectoryAuthority("dizum", "194.109.206.212", 80, 443),
      new DirectoryAuthority("bastet", "204.13.164.118", 80, 443),
      new DirectoryAuthority("gabelmoo", "131.188.40.189", 80, 443),
      new DirectoryAuthority("moria1", "128.31.0.34", 9131, 9101),
      new DirectoryAuthority("dannenberg", "193.23.244.244", 80, 443),
      new DirectoryAuthority("faravahar", "154.35.175.225", 80, 443),
    ];
    this._parsedConsensus = [];
    this._httpClient = axios.create({
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 Safari/537.36",
      },
    });
  }

  getRandomDirectoryAuthority() {
    return this._directoryAuthorities[
      Math.floor(Math.random() * this._directoryAuthorities.length)
    ];
  }

  async parseConsensus(consensusUrl: string, limit = 200) {
    const response = await this._httpClient.get(consensusUrl);

    let onionRouterCount = 1;
    let onionRouter: OnionRouter | null = null;

    for (let line of response.data.split("\n")) {
      line = line.decode();
      if (line.startsWith("r ")) {
        const splitLine = line.split(" ");
        const nickname = splitLine[1];
        const ip = splitLine[6];
        const torPort = parseInt(splitLine[7]);
        const dirPort = parseInt(splitLine[8]);
        const identity = splitLine[2] + "=".repeat(-splitLine[2].length % 4);
        const identityBase16 = Buffer.from(identity, "base64").toString("hex");

        if (dirPort === 0) {
          onionRouter = null;
          continue;
        }

        onionRouter = new OnionRouter(
          nickname,
          ip,
          dirPort,
          torPort,
          identityBase16
        );
      } else if (line.startsWith("s ")) {
        if (onionRouter) {
          const flags: string[] = [];
          for (const token of line.split(" ")) {
            if (token == "s") {
              continue;
            }
            flags.push(token.lower().replace("\n", ""));
          }

          if (
            ["stable", "fast", "valid", "running"].every((flag) =>
              flags.includes(flag)
            )
          ) {
            onionRouter.flags = flags;
            onionRouterCount += 1;
            this._parsedConsensus.push(onionRouter);
          }
        }
      }
      if (onionRouterCount >= limit) {
        return;
      }
    }
  }

  getRandomGuardRelay() {
    const guardRelays: OnionRouter[] = [];
    for (const onionRouter of this._parsedConsensus) {
      if (onionRouter.nickname.includes("guard")) {
        guardRelays.push(onionRouter);
      }
    }
    return guardRelays[Math.floor(Math.random() * guardRelays.length)];
  }

  getRandomOnionRouter() {
    return this._parsedConsensus[
      Math.floor(Math.random() * this._parsedConsensus.length)
    ];
  }
}

export default Consensus;
