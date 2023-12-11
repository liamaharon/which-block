import { ApiPromise, WsProvider } from "@polkadot/api";

async function main() {
  if (process.argv.length !== 4) {
    console.error("Must pass exactly 2 args, an rpc url and storage key");
    process.exit(1);
  }
  const rpc = process.argv[2];
  const key = process.argv[3];
  const provider = new WsProvider(rpc);

  const api = await ApiPromise.create({ provider });
  const [chain, nodeName, nodeVersion] = await Promise.all([
    api.rpc.system.chain(),
    api.rpc.system.name(),
    api.rpc.system.version(),
  ]);

  console.log(`Connected to ${chain} using ${nodeName} v${nodeVersion}`);

  const headHash = await api.rpc.chain.getFinalizedHead();
  const head = (await api.rpc.chain.getHeader(headHash)).number.toNumber();

  // Ensure the storage value exists at the chain head
  // @ts-ignore
  const value = (await api.rpc.state.getStorage(key, headHash)).toHuman();
  if (value === null) {
    console.error(
      `Storage key ${key} does not exist at the chain head ${head}`,
    );
    process.exit(1);
  }

  console.log(
    `Storage key ${key} exists at the chain head ${head}: ${value}. Finding block of first appearance.`,
  );

  const firstAppearanceBlock = await findFirstAppearanceBlock(
    api,
    key,
    value,
    0,
    head,
  );

  console.log(
    `Storage key ${key} first appeared at block ${firstAppearanceBlock}`,
  );

  process.exit(0);
}

async function findFirstAppearanceBlock(
  api: ApiPromise,
  key: string,
  value: string,
  start: number,
  end: number,
): Promise<number> {
  while (start <= end) {
    const mid = Math.floor((start + end) / 2);
    console.log(`Checking ${mid}`);
    const blockHash = await api.rpc.chain.getBlockHash(mid);

    // @ts-ignore
    const valueAtMid = (
      await api.rpc.state.getStorage(key, blockHash)
    ).toHuman();

    if (valueAtMid === value) {
      console.log(`Exists`);
      end = mid - 1;
    } else {
      console.log(`Doesn't exist`);
      start = mid + 1;
    }
  }

  return start;
}

main();
