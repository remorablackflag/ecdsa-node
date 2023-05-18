const { secp256k1 } = require("ethereum-cryptography/secp256k1.js");
const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;

app.use(cors());
app.use(express.json());

const balances = {
    // "0x1": 100,
    // "0x2": 50,
    // "0x3": 75,
};

app.get("/balance/:address", (req, res) => {
    const { address } = req.params;
    
    // initialize balance in case the server has been restarted since registration
    setInitialBalance(address);

    res.send({ balance: balances[address] });
});

app.post("/register", (req, res) => {
    const { addressList } = req.body;
    console.log("Registration request: ", addressList);
    addressList.forEach(e => setInitialBalance(e));
    res.send({});
});

app.post("/send", (req, res) => {
    
    const {
        sender,
        amount,
        recipient,
        messageHash,
        signature
    } = convertBody(req.body);

    if (!signature.r /** || ... */) {
        console.log("Request body is invalid: ", req.body);
        return res.status(400).send({ message: "Request payload is invalid!" });
    }

    // @TODO validate + store nonce to prevent replay attacks !!!
    
    if (!verify(messageHash, signature /**, nonce */)) {
        return res.status(400).send({ message: "Invalid signature!" });
    }

    // initialize balance in case the server has been restarted since registration
    setInitialBalance(sender);
    setInitialBalance(recipient);

    switch(true) {
        case (amount < 0):
            return res.status(400).send({ message: "Invalid amount!" });
        case (!balances[recipient]):
            return res.status(400).send({ message: "Recipient not found!" });
        case (balances[sender] < amount):
            return res.status(400).send({ message: "Not enough funds!" });
        default:
            balances[sender] -= amount;
            balances[recipient] += amount;
            console.log("Transfered (from, to, amount): ", sender, recipient, amount);
            return res.send({ balance: balances[sender] });
    }
});

app.listen(port, () => {
    console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
    if (!balances[address]) {
        balances[address] = 50;
        console.log("Initial balance set: ", address, balances[address]);
    }
};

function convertBody({
        sender,
        amount,
        recipient,
        messageHash,
        signature
    }) {

    if (!signature /** || ... */) {
        return {};
    }

    try {
        return {
            sender,
            amount,
            recipient,
            messageHash: new Uint8Array(Object.values(messageHash)),
            signature: new secp256k1.Signature(BigInt(signature.r), BigInt(signature.s), signature.recovery)
        };
    } catch(err) {
        console.log("Body conversion failed: ", err);
        return {};
    }
};

function verify(messageHash, signature) {
    const publicKey = signature.recoverPublicKey(messageHash).toHex(true);

    if (undefined === balances[publicKey]) {
        return false;
    }

    return secp256k1.verify(signature, messageHash, publicKey);
}

