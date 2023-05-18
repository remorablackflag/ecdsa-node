function AddressSelector({ addressList, selectedAddress, setSelectedAddress }) {
    async function onChange(evt) {
        const address = evt.target.value;
        setSelectedAddress(address);
    }

    function getSelectOptions(options) {
        return [<option key="opt" value="" disabled hidden>Select a wallet...</option>]
            .concat(options.map((value, i) => (<option key={`opt${i}`} value={value}>0x{value}</option>)));
    }

    return (
        <select value={selectedAddress} onChange={onChange}>
            {getSelectOptions(addressList)}
        </select>
    );
}

export default AddressSelector;