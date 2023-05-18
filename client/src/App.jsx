import { secp256k1 } from "ethereum-cryptography/secp256k1.js";
import { toHex } from "ethereum-cryptography/utils.js";
import AddressSelector from "./AddressSelector";
import Wallet from "./Wallet";
import Transfer from "./Transfer";
import server from "./server";
import "./App.scss";
import { useEffect, useState } from "react";

// @TODO private keys should be generated outside the app
let PRIVATE_KEYS;
try {
    PRIVATE_KEYS = JSON.parse(localStorage.getItem("private_keys"))
        .map(obj => new Uint8Array(Object.values(obj)));
} catch (err) {
    console.log(err);
}

// console.log("Private keys fro storage: ", PRIVATE_KEYS);

if (
    !PRIVATE_KEYS
    || !PRIVATE_KEYS.length
    || Uint8Array !== PRIVATE_KEYS[0].constructor
) {
    console.log("Generating new private keys...");
    PRIVATE_KEYS = [
        secp256k1.utils.randomPrivateKey(),
        secp256k1.utils.randomPrivateKey(),
        secp256k1.utils.randomPrivateKey(),
    ];
    localStorage.setItem("private_keys", JSON.stringify(PRIVATE_KEYS));
}

// console.log("Private keys: ", PRIVATE_KEYS);

const PUBLIC_KEYS = [
    toHex(secp256k1.getPublicKey(PRIVATE_KEYS[0], true)),
    toHex(secp256k1.getPublicKey(PRIVATE_KEYS[1], true)),
    toHex(secp256k1.getPublicKey(PRIVATE_KEYS[2], true)),
];

try {
    const result = await server.post("register", { addressList: PUBLIC_KEYS });
    console.log("Registration response: ", result.statusText);
} catch (ex) {
    alert("Public key registration failed");
    console.log(ex.response.data.message);
}

function App() {
    const [balance, setBalance] = useState(0);
    const [selectedAddress, setSelectedAddress] = useState("");
    const [selectedPrivateKey, setSelectedPrivateKey] = useState("");
    const [publicKeys, setPublicKeys] = useState(PUBLIC_KEYS);
    const [privateKeys, setPrivateKeyList] = useState(PRIVATE_KEYS);

    useEffect(() => {
        (async () => {
            if (selectedAddress) {
                const {
                    data: { balance },
                } = await server.get(`balance/${selectedAddress}`);
                console.log("Balance response: ", selectedAddress, balance);
                setBalance(balance);
                setSelectedPrivateKey(PRIVATE_KEYS[publicKeys.indexOf(selectedAddress)]);
            } else {
                setSelectedPrivateKey("");
                setBalance(0);
            }
        })();
    }, [selectedAddress]);

    function clearButtonClicked() {
        localStorage.removeItem("private_keys");
    }

    return (
        <div className="app">
            <Wallet
                balance={balance}
                setBalance={setBalance}
                privateKeys={privateKeys}
                addressList={publicKeys}
                selectedAddress={selectedAddress}
                setSelectedAddress={setSelectedAddress}
            >
                <AddressSelector
                    addressList={publicKeys}
                    selectedAddress={selectedAddress}
                    setSelectedAddress={setSelectedAddress}
                />
            </Wallet>
            <Transfer
                setBalance={setBalance}
                addressList={publicKeys}
                sender={selectedAddress}
                privateKey={selectedPrivateKey}
            />
            <div className="container">
                <label htmlFor="clearButton">Delete private keys from localStorage:</label>
                <button id="clearButton" onClick={clearButtonClicked}>Clear localStorage</button>
            </div>
        </div>
    );
}

export default App;
