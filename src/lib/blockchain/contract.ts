import { ethers } from 'ethers';

/* ----------------------------------
   Environment checks
---------------------------------- */

const RPC_URL = process.env.POLYGON_AMOY_RPC_URL;
const CONTRACT_ADDRESS = process.env.ANCHOR_CONTRACT_ADDRESS;
const PRIVATE_KEY = process.env.ANCHOR_PRIVATE_KEY;

if (!RPC_URL || !CONTRACT_ADDRESS || !PRIVATE_KEY) {
  throw new Error('Missing blockchain environment variables');
}

/* ----------------------------------
   Provider & Signer
---------------------------------- */

const provider = new ethers.JsonRpcProvider(RPC_URL);
const signer = new ethers.Wallet(PRIVATE_KEY, provider);

/* ----------------------------------
   Contract ABI (minimal)
---------------------------------- */

const VisitAnchorABI = [
  // anchorRoot(bytes32 trialId, uint256 day, bytes32 merkleRoot)
  'function anchorRoot(bytes32 trialId, uint256 day, bytes32 merkleRoot)',

  // getRoot(bytes32 trialId, uint256 day) view returns (bytes32)
  'function getRoot(bytes32 trialId, uint256 day) view returns (bytes32)',
];

/* ----------------------------------
   Contract instance
---------------------------------- */

export const visitAnchorContract = new ethers.Contract(
  CONTRACT_ADDRESS,
  VisitAnchorABI,
  signer
);

/* ----------------------------------
   Helper functions
---------------------------------- */

/**
 * Anchor a Merkle root on-chain
 */
export async function anchorMerkleRoot(
  trialId: string,
  day: number,
  merkleRoot: string
) {
  const tx = await visitAnchorContract.anchorRoot(
    trialId,
    day,
    merkleRoot
  );

  const receipt = await tx.wait();

  return {
    txHash: receipt.hash,
    blockNumber: receipt.blockNumber,
  };
}

/**
 * Read anchored root from chain (verification)
 */
export async function getAnchoredRoot(
  trialId: string,
  day: number
): Promise<string> {
  return await visitAnchorContract.getRoot(trialId, day);
}
