export const ZAEON_CONFIG = {
  // Cronos Testnet Chain ID
  CHAIN_ID: "0x152", // 338 decimal
  RPC_URL: "https://evm-t3.cronos.org",
  
  // Addresses from your Phase 1 deployment
  ADDRESSES: {
    REGISTRY: "0x68A13fF450cC596FA33F6d7c027788820e4eea59",
    GATEKEEPER: "0x7cB450a0054E01B221709f2Cf5ca8650035760A1",
    ASSET: "0x8b34f2520362B4B76a1E21a73F5448BD3865267c",
    TREASURY: "0x8249F6bBAc1C2A22a907753D25f0F55276463e67"
  },

  // Constants
  ROLES: {
    RESEARCHER: "0x9da1e5a6c90b3c9b15ac2e4dba14baea8001de373de8af9c768c6304062cf9fa"
  },
  INTENT: {
    GENESIS: "0x0000000000000000000000000000000000000000000000000000000000000001"
  }
};

export const ABIS = {
  REGISTRY: [
    "function registerAgent(address _agentAddress, string _name, bytes32 _modelHash, bytes32 _role) external",
    "function hasRole(bytes32 role, address account) external view returns (bool)",
    "function agents(address) external view returns (string, bytes32, uint256, bool)"
  ],
  ASSET: [
    "function mintResearch(string _contentHash, bytes32 _intentHash, bytes _contextData) external",
    "function ownerOf(uint256 tokenId) external view returns (address)",
    "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)"
  ],
  TREASURY: [
    "function claimResearchFunding(uint256 _tokenId, bytes32 _intentHash, bytes _contextData) external",
    "function calculateDynamicReward() external view returns (uint256)",
    "event FundsAllocated(address indexed agent, uint256 indexed tokenId, uint256 amount)"
  ]
};