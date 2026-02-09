import { Connection, PublicKey, SystemProgram } from '@solana/web3.js'
import { Program, AnchorProvider, BN, type Idl } from '@coral-xyz/anchor'
import { IDL } from './idl'

export const PROGRAM_ID = new PublicKey('5RPvUJ1pAQpeADq4QDX179etC3SUmk6q1TFdMYYqGNPF')
export const DEVNET_RPC = 'https://api.devnet.solana.com'

export function getConnection() {
  return new Connection(DEVNET_RPC, 'confirmed')
}

export function findElitPDA(owner: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('elit'), owner.toBuffer()],
    PROGRAM_ID
  )
}

export function findDelegationPDA(elit: PublicKey, delegate: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('delegation'), elit.toBuffer(), delegate.toBuffer()],
    PROGRAM_ID
  )
}

export function getProgram(provider: AnchorProvider) {
  // @ts-expect-error - Anchor v0.32 constructor signature
  return new Program(IDL as unknown as Idl, PROGRAM_ID, provider)
}

export function getProvider(connection: Connection, wallet: { publicKey: PublicKey; signTransaction: (...args: unknown[]) => unknown; signAllTransactions: (...args: unknown[]) => unknown }) {
  return new AnchorProvider(connection, wallet as never, { commitment: 'confirmed' })
}

export function explorerUrl(sig: string) {
  return `https://explorer.solana.com/tx/${sig}?cluster=devnet`
}

export function explorerAccountUrl(address: string) {
  return `https://explorer.solana.com/address/${address}?cluster=devnet`
}

// ── Create Elit on-chain ──
export async function createElitOnChain(
  program: Program,
  owner: PublicKey,
  name: string,
  bio: string,
  personalityHash: string,
  avatarUri: string,
): Promise<string> {
  const [elitPDA] = findElitPDA(owner)
  const tx = await (program.methods as any)
    .createElit(name, bio, personalityHash, avatarUri)
    .accounts({
      elit: elitPDA,
      owner,
      systemProgram: SystemProgram.programId,
    })
    .rpc()
  return tx
}

// ── Fetch Elit account from chain ──
export async function fetchElitAccount(
  program: Program,
  owner: PublicKey,
): Promise<{
  owner: PublicKey
  name: string
  bio: string
  personalityHash: string
  avatarUri: string
  createdAt: BN
  status: { active?: Record<string, never> } | { revoked?: Record<string, never> }
  bump: number
} | null> {
  const [elitPDA] = findElitPDA(owner)
  try {
    const account = await (program.account as any).elitAccount.fetch(elitPDA)
    return account
  } catch {
    return null
  }
}

// ── Verify Elit (call verify instruction) ──
export async function verifyElitOnChain(
  program: Program,
  ownerToVerify: PublicKey,
): Promise<string> {
  const [elitPDA] = findElitPDA(ownerToVerify)
  const tx = await (program.methods as any)
    .verifyElit()
    .accounts({ elit: elitPDA })
    .rpc()
  return tx
}

// ── Create Delegation on-chain ──
export async function delegateOnChain(
  program: Program,
  owner: PublicKey,
  delegateAuthority: PublicKey,
  scope: string,
  expiresAt: number,
  restrictions: string,
): Promise<string> {
  const [elitPDA] = findElitPDA(owner)
  const [delegationPDA] = findDelegationPDA(elitPDA, delegateAuthority)
  const tx = await (program.methods as any)
    .delegate(scope, new BN(expiresAt), restrictions)
    .accounts({
      elit: elitPDA,
      delegation: delegationPDA,
      owner,
      delegateAuthority,
      systemProgram: SystemProgram.programId,
    })
    .rpc()
  return tx
}

// ── Revoke Elit (kill switch) ──
export async function revokeElitOnChain(
  program: Program,
  owner: PublicKey,
): Promise<string> {
  const [elitPDA] = findElitPDA(owner)
  const tx = await (program.methods as any)
    .revokeElit()
    .accounts({ elit: elitPDA, owner })
    .rpc()
  return tx
}

// ── Revoke Delegation ──
export async function revokeDelegationOnChain(
  program: Program,
  owner: PublicKey,
  delegateAuthority: PublicKey,
): Promise<string> {
  const [elitPDA] = findElitPDA(owner)
  const [delegationPDA] = findDelegationPDA(elitPDA, delegateAuthority)
  const tx = await (program.methods as any)
    .revokeDelegation()
    .accounts({
      elit: elitPDA,
      delegation: delegationPDA,
      owner,
    })
    .rpc()
  return tx
}

export { SystemProgram, PublicKey, Connection, BN }
