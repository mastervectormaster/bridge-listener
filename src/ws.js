const ethers = require("ethers");
const { Network, Alchemy } = require("alchemy-sdk");
require("dotenv").config();

const BRIDGE_CONTRACT_ADDR = process.env.BRIDGE_CONTRACT_ADDR;
const BRIDGE_EVENT_TOPIC = ethers.utils.id(
  "SendToCosmosEvent(address,address,string,uint256)"
);
const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY

const iface = new ethers.utils.Interface([
  "event SendToCosmosEvent(address indexed token, address indexed sender, string recipient, uint256 amount)",
]);

const alchemy = new Alchemy({
  apiKey: ALCHEMY_API_KEY,
  network: Network.MATIC_MUMBAI,
});

var filter = {
  address: BRIDGE_CONTRACT_ADDR,
  topics: [BRIDGE_EVENT_TOPIC],
};

console.log("-----   Listener Start  -------")

alchemy.ws.on(filter, (data) => {
  console.log("Event from Bridge Received")
  const {token, sender, recipient, amount} = iface.decodeEventLog("SendToCosmosEvent", data.data, data.topics);

  console.log(sender)
  console.log(recipient)
  console.log(amount.toNumber())
});
