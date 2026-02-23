import { useState, useEffect,useRef } from "react";
import Sidebar from "./Sidebar";
import { socket } from './Socket'
import html2pdf from 'html2pdf.js';

export default function Vendors() {
    const contentRef = useRef();

    const [showAdd, toggleShowAdd] = useState(false);
    const [showVendorRec, toggleShowVendorRec] = useState(false);
    const [paymentClick, togglePaymentClick] = useState(false);

    const [vendorId, setVendorId] = useState('');

    const [vendor, setVendor] = useState('');
    const [vendorPhone, setVendorPhone] = useState('');
    const [openingBalance, setOpeningBalance] = useState('');

    const [vendorData, setVendorData] = useState([]);
    const [vendorLedger, setVendorLedger] = useState([]);

    const [vendorName, setVendorName] = useState('');

    const [method, setMethod] = useState('');
    const [vendorSelect, setVendorSelect] = useState('');
    const [expenseData, setExpenseData] = useState([]);
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState(new Date());

    const addClick = () => {
        toggleShowAdd(!showAdd);
    }

    const addPaymentClick = () => {
        setVendorSelect(vendorId);
        togglePaymentClick(!paymentClick);
    }

    const vendorClick = (id, name) => {
        toggleShowVendorRec(!showVendorRec);
        setVendorId(id);
        setVendorName(name);
    }

    const downloadPDF = () => {
        const element = contentRef.current;
        const options = {
            margin: 10,
            filename: `${vendorName}_Ledger.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        html2pdf().set(options).from(element).save();
    };

    const printPDF = () => {
        const element = contentRef.current;
        const options = {
            margin: 10,
            filename: `${vendorName}_Ledger.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        html2pdf()
            .set(options)
            .from(element)
            .toPdf()
            .get('pdf')
            .then((pdf) => {
                pdf.autoPrint();
                window.open(pdf.output('bloburl'), '_blank');
            });
    };

    useEffect(() => {
        if (vendorId) {
            const fetchVendorLedger = async () => {
                const response = await fetch(`https://cms-backend-production.up.railway.app/vendors/ledger/show/${vendorId}`);
                if (!response.ok) {
                    console.log('Error retrieving data');
                }
                const result = await response.json();
                setVendorLedger(result);
            }

            fetchVendorLedger();

            socket.emit('join-vendor-ledger', vendorId);
            socket.on('vendor-ledger-updated', fetchVendorLedger);

            return () => {
                socket.off('vendor-ledger-updated', fetchVendorLedger);
            }
        }
    }, [vendorId]);


    const addVendor = async () => {
        if (!vendor || !vendorPhone || !openingBalance) {
            alert("Please fill in details properly");
            return;
        }
        
        try {
            const response = await fetch('https://cms-backend-production.up.railway.app/vendors/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ vendor, vendorPhone, openingBalance })
            })

            const result = await response.json();
            setVendorData(prev => [
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
        toggleShowAdd(false);
    }

    useEffect(() => {
        const fetchVendors = async () => {
            try {
                const response = await fetch('https://cms-backend-production.up.railway.app/vendors/show');
                if (!response.ok) {
                    console.log('Error retrieving data');
                }

                const result = await response.json();
                setVendorData(result);
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

    const addExpense = async () => {
        const type = 'purchase';
        const project = '';

        if (!amount || !method) {
            alert("Please fill in Amount and Method");
            return;
        }

        try {
            const response = await fetch('https://cms-backend-production.up.railway.app/expenses/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type,
                    amount,
                    project,
                    vendor: vendorName,
                    method
                })
            })

            if (!response.ok) {
                const errText = await response.text();
                console.error("Backend Error:", errText);
                return;
            }

            const result = await response.json();

            setExpenseData(prev => [
                ...prev,
                {
                    expense_id: result.expense_id,
                    type,
                    reference_name: vendorName,
                    amount,
                    method,
                    date: new Date().toLocaleDateString('en-GB')
                }
            ]);

        } catch (error) {
            console.log('Error occured: ', error);
        }

        setAmount('');
        setVendorSelect('');
        setMethod('');
        togglePaymentClick(false);
    }

    return (
        <div className="main-clients">
            <Sidebar />
            <div className="client-page">
                <div className="client-heading">
                    <h1>Vendors</h1>
                    <button onClick={addClick}>Add</button>
                </div>

                <div className='client-list'>
                    <ul>
                        <li className='list-header invoice-ledger'>
                            <span className='col'>Vendor</span>
                            <span className='col'>Phone</span>
                            <span className='col'>Current Balance</span>
                        </li>

                        {Array.isArray(vendorData) && vendorData.map((item, index) => (
                            <li
                                key={item.vendor_id || index}
                                className='client-listitem invoice-ledger'
                                onClick={() => vendorClick(item.vendor_id, item.vendor_name)}
                            >
                                <span className='col'>
                                    {item.vendor_name || <span style={{ color: 'red' }}>MISSING NAME</span>}
                                </span>

                                <span className='col'>
                                    {item.phone || <span style={{ color: 'red' }}>MISSING PHONE</span>}
                                </span>
                                <span className='col' style={{ fontWeight: 'bold' }}>
                                    {item.current_balance ? item.current_balance.toLocaleString() : '0'}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {showVendorRec && (
                <div className='popup-overlay'>
                    <div className='purchase-popup'>
                        <div className='close-div'>
                            <button onClick={() => toggleShowVendorRec(false)} className="close-btn">
                                &times;
                            </button>
                        </div>

                        <div className='popup-header'>
                            <h2>{vendorName}</h2>
                            
                            <div className="header-btns">
                                    <button className='header-add-btn' onClick={addPaymentClick}>
                                        Pay
                                    </button>
                                     <button onClick={printPDF} className="download-btn" style={{ marginRight: '10px' }}>
                                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#808183">
                                            <path d="M640-640v-120H320v120h-80v-200h480v200h-80Zm-480 80h640-640Zm560 100q17 0 28.5-11.5T760-500q0-17-11.5-28.5T720-540q-17 0-28.5 11.5T680-500q0 17 11.5 28.5T720-460Zm-80 260v-160H320v160h320Zm80 80H240v-160H80v-240q0-33 23.5-56.5T160-600h640q33 0 56.5 23.5T880-520v240H720v160Zm80-240v-160q0-17-11.5-28.5T760-560H160q-17 0-28.5 11.5T120-520v160h120v-80h480v80h120Z" />
                                        </svg>
                                    </button>
                                    <button onClick={downloadPDF} className="download-btn">
                                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#808183"><path d="M440-800v487L216-537l-56 57 320 320 320-320-56-57-224 224v-487h-80Z"/></svg>
                                    </button>
                                </div>
                        </div>

                        <div className='client-list' ref={contentRef}>
                            <ul>
                                <li className='list-header ledger-table'>
                                    <span className='col'>Date</span>
                                    <span className='col'>Description</span>
                                    <span className='col'>Debit</span>
                                    <span className='col'>Credit</span>
                                    <span className='col'>Balance</span>
                                </li>

                                {Array.isArray(vendorLedger) && vendorLedger.map((item, index) => (
                                    <li key={item.vendor_ledger_id || index} className='client-listitem ledger-table'>
                                        <span className='col'>{item.date || <span style={{ color: 'red' }}>MISSING DATE</span>}</span>
                                        <span className='col'>{item.description || <span style={{ color: 'red' }}>MISSING DESCRIPTION</span>}</span>
                                        <span className='col'>{item.debit || <span>0</span>}</span>
                                        <span className='col'>{item.credit || <span>0</span>}</span>
                                        <span className='col'>{item.balance || 0}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            {showAdd && (
                <div className="vendor-popup-overlay">
                    <div className="add-popup vendor-popup">
                        <div className='close-div'>
                            <button
                                onClick={() => toggleShowAdd(false)}
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

            {paymentClick && (
                <div className='popup-overlay'>
                    <div className='add-popup'>
                        <div className='close-div'>
                            <button onClick={() => togglePaymentClick(false)} className="close-btn">
                                &times;
                            </button>
                        </div>

                        <h2>New Payment</h2>
                        <div className='project-subtitle'>{vendorName}</div>

                        <div className='add-div'>
                            <input
                                placeholder='Amount'
                                type="number"
                                onChange={(e) => setAmount(e.target.value)}
                                value={amount}
                            />
                        </div>

                        <div className='add-div'>
                            <select
                                className='client-dropdown'
                                onChange={(e) => setMethod(e.target.value)}
                                value={method}
                            >
                                <option value=''>Select Method</option>
                                <option value='cheque'>Cheque</option>
                                <option value='cash'>Cash</option>
                                <option value='bank'>Bank Transfer</option>
                            </select>
                        </div>

                        <div className='popup-date-row'>
                            <span>Date:</span>
                            <span>{date.toLocaleDateString()}</span>
                        </div>

                        <button className='add-btn' onClick={addExpense}>
                            Confirm Payment
                        </button>
                    </div>
                </div>
            )}

        </div>
    )
}