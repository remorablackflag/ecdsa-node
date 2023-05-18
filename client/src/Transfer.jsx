import { secp256k1 } from "ethereum-cryptography/secp256k1.js";
import { keccak256 } from "ethereum-cryptography/keccak.js";
import { utf8ToBytes } from "ethereum-cryptography/utils.js";
import { useState } from "react";
import server from "./server";
import AddressSelector from "./AddressSelector";

function Transfer({ sender, addressList, privateKey, setBalance }) {
    const [sendAmount, setSendAmount] = useState("");
    const [recipient, setRecipient] = useState("");

    const setValue = (setter) => (evt) => setter(evt.target.value);
    
    function hashMessage(message) {
        return keccak256(
            utf8ToBytes(
                JSON.stringify(message)
            )
        );
    }

    function signMessage(message, privkey) {
        return secp256k1.sign(message, privkey);
    }

    async function transfer(evt) {
        evt.preventDefault();
        
        const message = {
            sender,
            amount: parseInt(sendAmount),
            recipient
        };

        message.messageHash = hashMessage(message);
        message.signature = signMessage(message.messageHash, privateKey);
        
        // axios can not handle bigint in JSON
        message.signature.r = message.signature.r.toString();
        message.signature.s = message.signature.s.toString();

        // @TODO add nonce to prevent replay attacks !!!
        
        try {    
            const {
                data: { balance },
            } = await server.post("send", message);
            
            setBalance(balance);
        } catch (ex) {
            alert((ex.response && ex.response.data) ? ex.response.data.message : ex);
        }
    }

    return (
        <form className="container transfer" onSubmit={transfer}>
            <h1>Send Transaction</h1>

            <label>
                Send Amount
                <input
                    placeholder="1, 2, 3..."
                    value={sendAmount}
                    onChange={setValue(v => setSendAmount(parseInt(v)))}
                ></input>
            </label>

            <label>
                Recipient
                <AddressSelector
                    addressList={addressList}
                    selectedAddress={recipient}
                    setSelectedAddress={setRecipient}
                />
            </label>

            <input type="submit" className="button" value="Transfer" disabled={(!sender || !recipient || !sendAmount)} />
        </form>
    );
}

export default Transfer;
