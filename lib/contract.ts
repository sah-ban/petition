export const PETITION_CONTRACT_ADDRESS =
  "0x0D200C939A97B2ACF15a62Ed9b9fBA48c47CC569" as `0x${string}`;

export const SEPOLIA_CHAIN_ID = 11155111;

export const PETITION_ABI = [
  {
    type: "function",
    name: "createPetition",
    inputs: [
      { name: "_title", type: "string", internalType: "string" },
      { name: "_description", type: "string", internalType: "string" },
      { name: "_imageUrl", type: "string", internalType: "string" },
      { name: "_targetGoal", type: "uint256", internalType: "uint256" },
      { name: "_deadline", type: "uint256", internalType: "uint256" },
    ],
    outputs: [{ name: "petitionId", type: "uint256", internalType: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "updatePetition",
    inputs: [
      { name: "_petitionId", type: "uint256", internalType: "uint256" },
      { name: "_title", type: "string", internalType: "string" },
      { name: "_description", type: "string", internalType: "string" },
      { name: "_imageUrl", type: "string", internalType: "string" },
      { name: "_targetGoal", type: "uint256", internalType: "uint256" },
      { name: "_deadline", type: "uint256", internalType: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "signPetition",
    inputs: [{ name: "_petitionId", type: "uint256", internalType: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "closePetition",
    inputs: [{ name: "_petitionId", type: "uint256", internalType: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "getPetition",
    inputs: [{ name: "_petitionId", type: "uint256", internalType: "uint256" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        internalType: "struct OnChainPetition.Petition",
        components: [
          { name: "id", type: "uint256", internalType: "uint256" },
          { name: "creator", type: "address", internalType: "address" },
          { name: "title", type: "string", internalType: "string" },
          { name: "description", type: "string", internalType: "string" },
          { name: "imageUrl", type: "string", internalType: "string" },
          { name: "targetGoal", type: "uint256", internalType: "uint256" },
          { name: "deadline", type: "uint256", internalType: "uint256" },
          {
            name: "signatureCount",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "status",
            type: "uint8",
            internalType: "enum OnChainPetition.Status",
          },
          { name: "createdAt", type: "uint256", internalType: "uint256" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getMyPetitions",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        internalType: "struct OnChainPetition.Petition[]",
        components: [
          { name: "id", type: "uint256", internalType: "uint256" },
          { name: "creator", type: "address", internalType: "address" },
          { name: "title", type: "string", internalType: "string" },
          { name: "description", type: "string", internalType: "string" },
          { name: "imageUrl", type: "string", internalType: "string" },
          { name: "targetGoal", type: "uint256", internalType: "uint256" },
          { name: "deadline", type: "uint256", internalType: "uint256" },
          {
            name: "signatureCount",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "status",
            type: "uint8",
            internalType: "enum OnChainPetition.Status",
          },
          { name: "createdAt", type: "uint256", internalType: "uint256" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getPetitionsByCreator",
    inputs: [{ name: "_creator", type: "address", internalType: "address" }],
    outputs: [{ name: "", type: "uint256[]", internalType: "uint256[]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getSigners",
    inputs: [{ name: "_petitionId", type: "uint256", internalType: "uint256" }],
    outputs: [{ name: "", type: "address[]", internalType: "address[]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getSignatureCount",
    inputs: [{ name: "_petitionId", type: "uint256", internalType: "uint256" }],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "hasAddressSigned",
    inputs: [
      { name: "_petitionId", type: "uint256", internalType: "uint256" },
      { name: "_signer", type: "address", internalType: "address" },
    ],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getTotalPetitions",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "isPetitionActive",
    inputs: [{ name: "_petitionId", type: "uint256", internalType: "uint256" }],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "view",
  },
  {
    type: "event",
    name: "PetitionCreated",
    inputs: [
      {
        name: "petitionId",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
      {
        name: "creator",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "title",
        type: "string",
        indexed: false,
        internalType: "string",
      },
      {
        name: "targetGoal",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "deadline",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "createdAt",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "PetitionSigned",
    inputs: [
      {
        name: "petitionId",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
      {
        name: "signer",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "signatureCount",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "PetitionClosed",
    inputs: [
      {
        name: "petitionId",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
      {
        name: "closedBy",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "PetitionUpdated",
    inputs: [
      {
        name: "petitionId",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
      {
        name: "updatedBy",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
] as const;
