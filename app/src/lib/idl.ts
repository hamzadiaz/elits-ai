export const IDL = {
  version: "0.1.0",
  name: "elits",
  instructions: [
    {
      name: "createElit",
      accounts: [
        { name: "elit", isMut: true, isSigner: false },
        { name: "owner", isMut: true, isSigner: true },
        { name: "systemProgram", isMut: false, isSigner: false },
      ],
      args: [
        { name: "name", type: "string" },
        { name: "bio", type: "string" },
        { name: "personalityHash", type: "string" },
        { name: "avatarUri", type: "string" },
      ],
    },
    {
      name: "verifyElit",
      accounts: [
        { name: "elit", isMut: false, isSigner: false },
      ],
      args: [],
    },
    {
      name: "delegate",
      accounts: [
        { name: "elit", isMut: false, isSigner: false },
        { name: "delegation", isMut: true, isSigner: false },
        { name: "owner", isMut: true, isSigner: true },
        { name: "delegateAuthority", isMut: false, isSigner: false },
        { name: "systemProgram", isMut: false, isSigner: false },
      ],
      args: [
        { name: "scope", type: "string" },
        { name: "expiresAt", type: "i64" },
        { name: "restrictions", type: "string" },
      ],
    },
    {
      name: "revokeElit",
      accounts: [
        { name: "elit", isMut: true, isSigner: false },
        { name: "owner", isMut: false, isSigner: true },
      ],
      args: [],
    },
    {
      name: "revokeDelegation",
      accounts: [
        { name: "elit", isMut: false, isSigner: false },
        { name: "delegation", isMut: true, isSigner: false },
        { name: "owner", isMut: false, isSigner: true },
      ],
      args: [],
    },
  ],
  accounts: [
    {
      name: "ElitAccount",
      type: {
        kind: "struct",
        fields: [
          { name: "owner", type: "publicKey" },
          { name: "name", type: "string" },
          { name: "bio", type: "string" },
          { name: "personality_hash", type: "string" },
          { name: "avatar_uri", type: "string" },
          { name: "created_at", type: "i64" },
          { name: "status", type: { defined: "ElitStatus" } },
          { name: "bump", type: "u8" },
        ],
      },
    },
    {
      name: "DelegationAccount",
      type: {
        kind: "struct",
        fields: [
          { name: "elit", type: "publicKey" },
          { name: "delegate", type: "publicKey" },
          { name: "scope", type: "string" },
          { name: "expires_at", type: "i64" },
          { name: "restrictions", type: "string" },
          { name: "created_at", type: "i64" },
          { name: "active", type: "bool" },
          { name: "bump", type: "u8" },
        ],
      },
    },
  ],
  types: [
    {
      name: "ElitStatus",
      type: {
        kind: "enum",
        variants: [
          { name: "Active" },
          { name: "Revoked" },
        ],
      },
    },
  ],
  errors: [
    {
      code: 6000,
      name: "ElitRevoked",
      msg: "This Elit has been revoked",
    },
  ],
} as const
