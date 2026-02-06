import { useEffect, useState } from 'react'
import './clients.css'
import Sidebar from './Sidebar';
import { socket } from './Socket';

export default function Purchases() {
    const [showAdd, toggleShowAdd] = useState(false);
    const [showVendor, toggleShowVendor] = useState(false);
    const [showPurchase, toggleShowPurchase] = useState(false);
    const [showInvoiceRecord, toggleShowInvoiceRecord] = useState(false);

    const [vendor, setVendor] = useState('');
    const [vendorPhone, setVendorPhone] = useState('');
    const [product, setProduct] = useState('');
    const [quantity, setQuantity] = useState('');
    const [unit, setUnit] = useState('');
    const [rate, setRate] = useState('');
    const [openingBalance, setOpeningBalance] = useState('');

    const [vendorFetch, setVendorFetch] = useState([]);
    const [vendorSelect, setVendorSelect] = useState('');
    const [date, setDate] = useState(new Date());

    const [productData, setProductData] = useState([]);
    const [invoiceId, setInvoiceId] = useState(null);
    const [invoiceNum, setInvoiceNum] = useState('');

    const [total, setTotal] = useState('');
    const [advance, setAdvance] = useState(0);
    const [remainingAmt, setRemainingAmt] = useState('');
    const [invoiceData, setInvoiceData] = useState([]);
    const [invoiceLedger, setInvoiceLedger] = useState([]);

    const addClick = () => {
        toggleShowAdd(!showAdd);
    }

    const vendorClick = () => {
        toggleShowVendor(!showVendor);
    }

    const addVendor = async () => {
        if (!vendor || !vendorPhone || !openingBalance) {
            alert("Please fill in details properly");
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/vendors/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ vendor, vendorPhone, openingBalance })
            })

            const result = await response.json();
            setVendorFetch(prev => [
                ...prev,
                {
                    vendor_id: result.insertId,
                    vendor_name: result.vendor_name,
                    phone: result.phone,
                    openingBalance: result.opening_balance
                }
            ])
        } catch (error) {
            console.log('Error occured: ', error);
        }

        setVendor('');
        setVendorPhone('');
        setOpeningBalance('');
        toggleShowVendor(false);
    }

    useEffect(() => {
        const fetchVendors = async () => {
            try {
                const response = await fetch('http://localhost:5000/vendors/show');
                if (!response.ok) {
                    console.log('Error retrieving data');
                }

                const result = await response.json();
                setVendorFetch(result);
            } catch (error) {
                console.log('Error occured: ', error);
            }
        }

        fetchVendors();

        socket.on('vendorAdded', () => {
            fetchVendors();
        });

        return () => {
            socket.off('vendorAdded');
        };
    }, []);

    const invoiceStart = async (vendor) => {
        try {
            const response = await fetch(`http://localhost:5000/invoice/start/${vendor}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ invoiceNum })
            })

            const result = await response.json();
            setInvoiceId({
                invoice_id: result.insertId,
                vendor_id: result.vendor_id,
                invoiceNum: result.invoiceNum
            })
        } catch (error) {
            console.log('Error occured: ', error);
        }
    }

    const addPurchase = async () => {
        let invoice_id = invoiceId.invoice_id;
        let total = quantity * rate;

        if (!product || !quantity || !unit || !rate) {
            alert("Please fill in details properly");
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/products/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ invoice_id, product, quantity, unit, rate, total })
            })

            const result = await response.json();
            setProductData(prev => [
                ...prev,
                {
                    invoice_item_id: result.insertId,
                    invoice_id: result.invoice_id,
                    product: result.product,
                    quantity: result.quantity,
                    unit: result.unit,
                    rate: result.rate,
                    total: result.total
                }
            ])
        } catch (error) {
            console.log('Error occured: ', error);
        }

        setProduct('');
        setQuantity('');
        setUnit('');
        setRate('');
    }

    useEffect(() => {
        if (!invoiceId) return;

        const fetchProducts = async () => {
            try {
                const response = await fetch(
                    `http://localhost:5000/products/show/${invoiceId.invoice_id}`
                );

                if (!response.ok) {
                    console.log('Error retrieving data');
                    return;
                }

                const result = await response.json();
                setProductData(result);
            } catch (error) {
                console.log('Error occurred:', error);
            }
        };

        fetchProducts();
    }, [invoiceId]);


    const deleteProduct = async (id) => {
        try {
            const response = await fetch(`http://localhost:5000/products/delete/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                setProductData(prev => prev.filter(item => item.invoice_item_id !== id));
            } else {
                const errMsg = await response.text();
                console.log("Error deleting Product:", errMsg);
            }

        } catch (error) {
            console.log('Error occured: ', error);
        }
    }

    useEffect(() => {
        if (!invoiceId) return;

        const fetchTotal = async () => {
            try {
                const response = await fetch(
                    `http://localhost:5000/purchase/total/${invoiceId.invoice_id}`
                );

                if (!response.ok) {
                    console.log('Error retrieving data');
                    return;
                }

                const result = await response.json();
                setTotal(result.total);
            } catch (error) {
                console.log('Error occurred:', error);
            }
        };

        fetchTotal();
    }, [invoiceId, productData]);

    useEffect(() => {
        const remaining = Number(total) - Number(advance);
        setRemainingAmt(remaining >= 0 ? remaining : 0);
    }, [total, advance]);

    const confirmPurchase = async () => {
        const vendorId = invoiceId.vendor_id;
        try {
            const response = await fetch(`http://localhost:5000/purchase/advance/${invoiceId.invoice_id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ advance, total, remainingAmt, vendorId })
            })
            const result = await response.json();

        } catch (error) {
            console.log('Error occured: ', error);
        }

        setInvoiceId([]);
        setAdvance(0);
        toggleShowAdd(!showAdd);
    }

    useEffect(() => {
        const fetchInvoices = async () => {
            try {
                const response = await fetch('http://localhost:5000/invoices/show');
                const result = await response.json();
                setInvoiceData(result);
            } catch (error) {
                console.log('Error occured:', error);
            }
        };

        fetchInvoices();

        socket.on('invoiceAdded', fetchInvoices);
        socket.on('invoiceUpdated', fetchInvoices);

        return () => {
            socket.off('invoiceAdded', fetchInvoices);
            socket.off('invoiceUpdated', fetchInvoices);
        };
    }, []);

    const invoiceClick = (id) => {
        toggleShowInvoiceRecord(!showInvoiceRecord);
        setInvoiceId(id);
    }

    useEffect(() => {
        if (invoiceId) {
            const fetchInvoiceLedger = async () => {
                const response = await fetch(`http://localhost:5000/invoices/ledger/show/${invoiceId}`);
                if (!response.ok) {
                    console.log('Error retrieving data');
                }

                const result = await response.json();
                setInvoiceLedger(result);
            }

            fetchInvoiceLedger();
        }
    }, [invoiceId]);

    return (
        <div className='main-clients'>
            <Sidebar />

            <div className='client-page'>
                <div className="client-heading">
                    <h1>Purchases</h1>

                    <button onClick={addClick}>Add</button>
                </div>

                {showVendor && (
                    <div className="vendor-popup-overlay">
                        <div className="add-popup vendor-popup">
                            <div className='close-div'>
                                <button
                                    onClick={() => toggleShowVendor(false)}
                                    className="close-btn"
                                >
                                    &times;
                                </button>
                            </div>

                            <h2>Add Vendor</h2>

                            <div className='add-div'>
                                <input placeholder='Vendor Name'
                                    onChange={(e) => setVendor(e.target.value)} value={vendor}></input>
                            </div>
                            <div className='add-div'>
                                <input placeholder='Phone Number'
                                    onChange={(e) => setVendorPhone(e.target.value)} value={vendorPhone}></input>
                            </div>
                            <div className='add-div'>
                                <input placeholder='Opening Balance'
                                    onChange={(e) => setOpeningBalance(e.target.value)} value={openingBalance}></input>
                            </div>

                            <button className='add-btn' onClick={addVendor}>Add</button>
                        </div>
                    </div>
                )}

                {showPurchase && (
                    <div className='vendor-popup-overlay'>
                        <div className="add-popup vendor-popup">
                            <div className='close-div'>
                                <button
                                    onClick={() => toggleShowPurchase(false)}
                                    className="close-btn"
                                >
                                    &times;
                                </button>
                            </div>

                            <h2>Purchases</h2>

                            <div className='add-div'>
                                <input placeholder='Product'
                                    onChange={(e) => setProduct(e.target.value)} value={product}></input>
                            </div>
                            <div className='add-div'>
                                <input placeholder='Quantity'
                                    onChange={(e) => setQuantity(e.target.value)} value={quantity}></input>
                            </div>
                            <div className='add-div'>
                                <input placeholder='Unit'
                                    onChange={(e) => setUnit(e.target.value)} value={unit}></input>
                            </div>
                            <div className='add-div'>
                                <input placeholder='Rate'
                                    onChange={(e) => setRate(e.target.value)} value={rate}></input>
                            </div>

                            <button className='add-btn' onClick={addPurchase}>Add</button>
                        </div>
                    </div>
                )}

                {showAdd && (
                    <div className='popup-overlay'>
                        <div className='purchase-popup'>
                            <div className='close-div'>
                                <button onClick={() => toggleShowAdd(false)} className="close-btn">
                                    &times;
                                </button>
                            </div>

                            <h2>New Purchase</h2>


                            <div className='vendor-section'>
                                <div className='invoice-section'>
                                    <h4>Invoice #:</h4>
                                    <input placeholder='0011223344' onChange={(e) => setInvoiceNum(e.target.value)} value={invoiceNum}></input>
                                </div>
                                <div className='vendor-dropdown-section'>
                                    <select name='vendors' required className='vendor-dropdown' onChange={
                                        (e) => {
                                            setVendorSelect(e.target.value)
                                            if (e.target.value) invoiceStart(e.target.value);
                                        }
                                    }>
                                        <option value=''>Select Vendor</option>
                                        {vendorFetch.map((vendor) => (
                                            <option
                                                key={vendor.vendor_id}
                                                value={vendor.vendor_name}
                                                onSelect={invoiceStart}
                                            >
                                                {vendor.vendor_name}
                                            </option>
                                        ))}
                                    </select>
                                    <button onClick={vendorClick}>+ Add</button>
                                </div>

                                <div className='invoice-section'>
                                    <h4>Date:</h4>
                                    <h4>{date.toLocaleDateString()}</h4>
                                </div>
                            </div>

                            <div className='purchase-heading'>
                                <h3>Purchases</h3>
                                <button onClick={toggleShowPurchase}>+ Add</button>
                            </div>

                            <div className='bottom-section'>
                                <div className='purchase-section'>
                                    <ul>
                                        <li className='product-list-header'>
                                            <span className='col'>Product</span>
                                            <span className='col'>Quantity</span>
                                            <span className='col'>Unit</span>
                                            <span className='col'>Rate</span>
                                            <span className='col'>Total</span>
                                            <span className='col-actions'>Options</span>
                                        </li>

                                        {Array.isArray(productData) && productData.map((item, index) => (
                                            <li key={item.invoice_item_id || index} className='client-listitem'>
                                                <span className='col'>{item.product || <span style={{ color: 'red' }}>MISSING PRODUCT</span>}</span>
                                                <span className='col'>{item.quantity || <span style={{ color: 'red' }}>MISSING QUANTITY</span>}</span>
                                                <span className='col'>{item.unit || <span style={{ color: 'red' }}>MISSING UNIT</span>}</span>
                                                <span className='col'>{item.rate || <span style={{ color: 'red' }}>MISSING RATE</span>}</span>
                                                <span className='col'>{item.total || <span style={{ color: 'red' }}>MISSING TOTAL</span>}</span>
                                                <span className='col col-actions'>
                                                    <button className='delete-btn' onClick={(e) => {
                                                        e.stopPropagation();
                                                        deleteProduct(item.invoice_item_id)
                                                    }}>
                                                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="red">
                                                            <path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 
                                                            56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 
                                                            0h80v-360h-80v360ZM280-720v520-520Z" />
                                                        </svg>
                                                    </button>
                                                </span>
                                            </li>
                                        ))}
                                    </ul>

                                </div>

                                <div className='summary-section'>
                                    <h3>Summary</h3>

                                    <div className='summary-details'>
                                        <div className='details-child'>
                                            <h4>Total:</h4>
                                            <h4>{total}</h4>
                                        </div>
                                        <div className='details-child'>
                                            <h4>Advance:</h4>
                                            <div className='add-div adv-div'>
                                                <input
                                                    placeholder='Advance'
                                                    value={advance}
                                                    onChange={(e) => setAdvance(Number(e.target.value) || 0)}
                                                />

                                            </div>
                                        </div>
                                        <div className='details-child'>
                                            <h4>Remaining:</h4>
                                            <h4>{remainingAmt}</h4>
                                        </div>
                                    </div>
                                </div>
                            </div>


                            <button className='add-btn confirm-btn' onClick={confirmPurchase}>Confirm</button>
                        </div>

                    </div>
                )}

                {showInvoiceRecord && (
                    <div className='popup-overlay'>
                        <div className='purchase-popup'>
                            <div className='close-div'>
                                <button onClick={() => toggleShowInvoiceRecord(false)} className="close-btn">
                                    &times;
                                </button>
                            </div>

                            <h2>Invoice Record</h2>

                            <div className='client-list'>
                                <ul>
                                    <li className='list-header invoice-ledger'>
                                        <span className='col'>Product</span>
                                        <span className='col'>Vendor</span>
                                        <span className='col'>Quantity</span>
                                        <span className='col'>Unit</span>
                                        <span className='col'>Rate</span>
                                        <span className='col'>Total</span>
                                    </li>

                                    {Array.isArray(invoiceLedger) && invoiceLedger.map((item, index) => (
                                        <li key={item.invoice_id || index} className='client-listitem invoice-ledger'>
                                            <span className='col'>{item.product || <span style={{ color: 'red' }}>MISSING PRODUCT</span>}</span>
                                            <span className='col'>{item.vendor || <span style={{ color: 'red' }}>MISSING VENDOR</span>}</span>
                                            <span className='col'>{item.quantity || <span style={{ color: 'red' }}>MISSING QUANTITY</span>}</span>
                                            <span className='col'>{item.unit || <span style={{ color: 'red' }}>MISSING UNIT</span>}</span>
                                            <span className='col'>{item.rate || <span style={{ color: 'red' }}>MISSING RATE</span>}</span>
                                            <span className='col'>{item.total || <span style={{ color: 'red' }}>MISSING TOTAL</span>}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                )}

                <div className='client-list'>
                    <ul>
                        <li className='list-header'>
                            <span className='col'>Invoice</span>
                            <span className='col'>Total</span>
                            <span className='col'>Advance</span>
                            <span className='col'>Balance</span>
                            <span className='col'>Date</span>
                        </li>

                        {Array.isArray(invoiceData) && invoiceData.map((item, index) => (
                            <li key={item.invoice_id || index} className='client-listitem' onClick={() => invoiceClick(item.invoice_id)}>
                                <span className='col'>{item.invoice_number || <span style={{ color: 'red' }}>MISSING INVOICE NUMBER</span>}</span>
                                <span className='col'>{item.total_amount || <span style={{ color: 'red' }}>MISSING AMOUNT</span>}</span>
                                <span className='col'>{item.advance_paid || 0}</span>
                                <span className='col'>{item.balance || <span style={{ color: 'red' }}>MISSING BALANCE</span>}</span>
                                <span className='col'>{item.invoice_date || <span style={{ color: 'red' }}>MISSING DATE</span>}</span>
                            </li>
                        ))}

                    </ul>
                </div>

            </div>
        </div>
    )
}