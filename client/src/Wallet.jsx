function Wallet({ balance, children }) {
    return (
        <div className="container wallet">
            <h1>Your Wallet</h1>

            <label>
                Wallet Address
                {children}
            </label>

            <div className="balance">Balance: {balance}</div>
        </div>
    );
}

export default Wallet;
