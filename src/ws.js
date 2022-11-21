const ethers = require("ethers");
const { Network, Alchemy } = require("alchemy-sdk");
const { exec } = require("child_process");
require("dotenv").config();

const BRIDGE_CONTRACT_ADDR = process.env.BRIDGE_CONTRACT_ADDR;
const BRIDGE_EVENT_TOPIC = ethers.utils.id(
  "SendToCosmosEvent(address,address,string,uint256)"
);
const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;

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

console.log("-----   Listener Start  -------");

alchemy.ws.on(filter, (data) => {
  console.log("Event from Bridge Received");
  const { token, sender, recipient, amount } = iface.decodeEventLog(
    "SendToCosmosEvent",
    data.data,
    data.topics
  );

  console.log(recipient)
  console.log(amount.toString())

  exec(
    // `blockxd tx bridge sent-to-blockx ${recipient} ${amount.toString()}abcx --from bridge --chain-id blockx_12345-1`,
    `blockxd tx bank send blockx1h40nl9n03xjdtjae4ppcds6yypm26vhn3zypkq ${recipient} ${amount.toString()}abcx --keyring-backend file --chain-id blockx_12345-1 --gas auto --from bridge`,
    (error, stdout, stderr) => {
      console.log('---------- errors -------------')
      console.log(error)
      console.log('---------- stdout -------------')
      console.log(stdout)
      console.log('---------- stderr -------------')
      console.log(stderr)
      if (error) {
        console.log(`error: ${error.message}`);
        return;
      }
      if (stderr) {
        console.log(`stderr: ${stderr}`);
        return;
      }
      console.log(`stdout: ${stdout}`);
    }
  );
});
