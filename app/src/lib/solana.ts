import { Connection, PublicKey, SystemProgram } from '@solana/web3.js'

export const PROGRAM_ID = new PublicKey('E1itsAiProgramXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX') // Will be updated after deploy

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

export { SystemProgram, PublicKey, Connection }
