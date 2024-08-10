-include .env

clean  :; forge clean


deploy-receiver :; forge script script/DeployReceiver.s.sol --rpc-url ${SEPOLIA_RPC}  --account ${ACCOUNT} --sender ${ADDRESS} --password-file .password --broadcast --legacy -vvvv  --etherscan-api-key ${ETHERSCAN_API_KEY}

verify-receiver :; forge verify-contract \
  --rpc-url ${SEPOLIA_RPC} \
  ${RECEIVER_ADDRESS} \
  CrossChainFlipACoinReceiver \
  --verifier blockscout \
  --verifier-url ${SEPOLIA_BLOCKSCOUT}


deploy-sender-base-sepolia :; forge script script/DeploySender.s.sol --rpc-url ${BASE_SEPOLIA_RPC}  --account ${ACCOUNT} --sender ${ADDRESS} --password-file .password --broadcast  -vvvv --etherscan-api-key ${BASE_ETHERSCAN_API_KEY}

verify-sender-base-sepolia :; forge verify-contract \
  --rpc-url ${BASE_SEPOLIA_RPC} \
  ${SENDER_BASE_SEPOLIA_ADDRESS} \
  src/CrossChainFlipACoinSender.sol:CrossChainFlipACoinSender \
  --verifier blockscout \
  --verifier-url ${BASE_SEPOLIA_BLOCKSCOUT} \
  --compiler-version 0.8.26


verify-sender-base-sepolia-etherscan :; forge verify-contract \
  --rpc-url ${BASE_SEPOLIA_RPC} \
  ${SENDER_BASE_SEPOLIA_ADDRESS} \
  CrossChainFlipACoinSender \
   --etherscan-api-key ${BASE_ETHERSCAN_API_KEY} \
  --compiler-version 0.8.26 --watch



verify-sender-base-sepolia-tenderly :; forge verify-contract \
  --rpc-url ${BASE_SEPOLIA_RPC} \
  ${SENDER_BASE_SEPOLIA_ADDRESS} \
  src/CrossChainFlipACoinSender.sol:CrossChainFlipACoinSender \
  --verifier-url ${TENDERLY_VERIFIER_URL} \
  --etherscan-api-key ${TENDERLY_API_KEY} \
  --compiler-version 0.8.26 \
  --watch
