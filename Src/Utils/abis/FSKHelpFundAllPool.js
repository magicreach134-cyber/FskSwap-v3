[
  {
    "inputs": [{ "internalType": "contract FskSwapLPStaking", "name": "_staking", "type": "address" }],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [
      { "internalType": "address[]", "name": "lpTokens", "type": "address[]" },
      { "internalType": "address[]", "name": "tokenA", "type": "address[]" },
      { "internalType": "address[]", "name": "tokenB", "type": "address[]" },
      { "internalType": "uint256[]", "name": "rewardPerBlock", "type": "uint256[]" },
      { "internalType": "uint256[]", "name": "initialFunding", "type": "uint256[]" }
    ],
    "name": "deployAllPools",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  { "inputs": [], "name": "staking", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }
]
