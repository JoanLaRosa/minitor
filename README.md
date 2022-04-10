# MiniTor

A mini client to interact with the Onion Router (Tor)

## Project Scope

We believe the most valuable learning experience would be to create a client for the system to which would allow us to solely focus on the protocol at hand. The protocol is well documented so we plan to create a client that will be built on top of a pre-existing SOCKS client for Proxy servers and build the Tor client on top of that. We could build a GUI, advanced client, and more but to make the project scope achievable, we plan on solely implementing an API with the same interface as the standard library’s modules. We are planning on doing a Node.js implementation written in TypeScript as it provides type safety and well-documented / easy to use HTTP and SOCKS modules. An example usage of the project would look like:

```
import Tor from "minitor";

const url = "https://duckduckgogg42xjoc72x3sjasowoarfbgcmvfimaftt6twagswzczad.onion/";
const tor = new Tor();
const response = await tor.fetch(url);
```

Where response is the standard Node.js format from the standard library.

# Setup

Install the dependencies with

```bash
npm install
```
