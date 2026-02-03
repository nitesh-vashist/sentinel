import { keccak256, getBytes, concat } from 'ethers';

/* ----------------------------------
   Helpers
---------------------------------- */

function normalize(hash: string): string {
  return hash.startsWith('0x') ? hash : `0x${hash}`;
}

/* ----------------------------------
   Merkle hashing
---------------------------------- */

function hashPair(left: string, right: string): string {
  const leftBytes = getBytes(normalize(left));
  const rightBytes = getBytes(normalize(right));

  return keccak256(concat([leftBytes, rightBytes]));
}

/* ----------------------------------
   Build Merkle Tree
---------------------------------- */

export function buildMerkleTree(leaves: string[]) {
  if (leaves.length === 0) {
    throw new Error('Cannot build Merkle tree with no leaves');
  }

  let level = leaves.map(normalize);

  while (level.length > 1) {
    const next: string[] = [];

    for (let i = 0; i < level.length; i += 2) {
      const left = level[i];
      const right = level[i + 1] ?? level[i]; // duplicate last if odd

      next.push(hashPair(left, right));
    }

    level = next;
  }

  return {
    root: level[0],
  };
}
