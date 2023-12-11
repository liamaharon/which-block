# Which Block

Using binary search, finds which block a piece of state was introduced into a Substrate based blockchain.

Useful for debugging undecodable state issues.

## Usage

`ts-node src/index.ts wss://some-rpc.io 0x123some-key-to-find-insertion-block456789abc`

Needs to be run against a node with archive state.
