# bhvr-forge ⚒️🦫

![cover](https://cdn.bhvr.dev/bhvr-forge.png)

A full-stack TypeScript and Solidity monorepo starter with shared types, using Bun, Hono, Vite, React, and Forge. Based of the existing [bhvr stack](https://bhvr.dev).

> [!WARNING]
> This repo is still under testing, please report any bugs you might have!

## Quickstart

First make sure you have Foundry installed on your machine. If you do not follow [these instructions](https://getfoundry.sh/introduction/installation/) and then run the command below to verify it's installed.

```bash
forge --version
```

Start a new `bhvr-forge` project with the CLI command below

```bash
bun create bhvr-forge@latest
```

`bhvr-forge` by default uses the local `Anvil` testnet that comes with Foundry. Start up the testnet in a separate terminal with the following command:

```bash
anvil
```

Then inside your project move into the `contracts` package and deploy it locally.

```bash
cd contracts
bun run deploy:local
```

This will compile the contracts, export types, and deploy to the Anvil testnet.

Now move back into the root of the project and run the dev command to start up the whole app.

```bash
cd ../
bun run dev
```

You should be able to call the contract counter state as well as the API in the server, with type sharing across the entire repo!

## Docs

Please visit the [official docs site](https://forge.bhvr.dev) for more info.

## Questions

[Feel free to contact me!](https://stevedylan.dev/links)
