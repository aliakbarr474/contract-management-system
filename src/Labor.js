import { useEffect, useRef, useState } from 'react'
import './clients.css'
import Sidebar from './Sidebar'
import html2pdf from 'html2pdf.js';
import { socket } from './Socket';

export default function Labor() {
    const contentRef = useRef();

    const [showAdd, toggleShowAdd] = useState(false);
    const [laborShow, toggleLaborShow] = useState(false);
    const [showPay, toggleshowPay] = useState(false);

    const [labor, setLabor] = useState('');
    const [salary, setSalary] = useState('');
    const [laborData, setLaborData] = useState([]);

    const [laborName, setLaborName] = useState('');
    const [method, setMethod] = useState('');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState(new Date());
    const [paymentData, setPaymentData] = useState([]);

    const addClick = () => {
        toggleShowAdd(!showAdd);
    }

    const laborClick = (name) => {
        toggleLaborShow(!laborShow);
        setLaborName(name);
    }

    const payClick = () => {
        toggleshowPay(!showPay);
    }

    const addLabor = async () => {
        if (!labor || !salary) {
            alert("Please fill in details properly");
            return;
        }


        try {
            const response = await fetch('https://cms-backend-production.up.railway.app/labor/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ labor, salary })
            })

            const result = await response.json();
            setLaborData(prev => [
                ...prev,
                { labor_id: result.insertId, labor_name: result.labor_name, salary: result.salary }
            ])
        } catch (error) {
            console.log('Error occured: ', error);
        }

        setLabor('');
        setSalary('');
    }

    useEffect(() => {
        const fetchLabor = async () => {
            try {
                const response = await fetch('https://cms-backend-production.up.railway.app/labor/show');
                if (!response.ok) {
                    console.log('Error retreiving labor');
                }
                const result = await response.json();
                setLaborData(result);
            } catch (error) {
                console.log('Error occured: ', error);
            }
        }
        fetchLabor();
    }, [])

    const deleteLabor = async (id) => {
        try {
            const response = await fetch(`https://cms-backend-production.up.railway.app/labor/delete/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                setLaborData(prev => prev.filter(item => item.labor_id !== id))
            } else {
                const errMsg = await response.text();
                console.log("Error deleting Labor:", errMsg);
            }
        } catch (error) {
            console.log('Error occured: ', error);
        }
    }


    const downloadPDF = () => {
        const element = contentRef.current;
        const options = {
            margin: 10,
            filename: `${laborName}_Ledger.pdf`,
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
            filename: `${laborName}_Ledger.pdf`,
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

    const confirmPayment = async () => {
        if (!amount || !method || !description) {
            alert('Please fill in details properly');
            return;
        }

        try {
            const response = await fetch('https://cms-backend-production.up.railway.app/labor/payments/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ laborName, amount, method, description })
            });
            const result = await response.json();
            setPaymentData(prev => [
                ...prev,
                {
                    labor_payment_id: result.insertId,
                    description: result.description,
                    amount: result.amount,
                    method: result.method,
                    date: result.date
                }
            ])

        } catch (error) {
            console.log('Error occured: ', error);
        }

        setAmount('');
        setMethod('');
        setDescription('');
        toggleshowPay(false);
    }

    useEffect(() => {
        const fetchLaborPyments = async () => {
            try {
                const response = await fetch('https://cms-backend-production.up.railway.app/labor/payments/show');
                if (!response.ok) {
                    console.log('Error retreiving labor');
                }
                const result = await response.json();
                setPaymentData(result);
            } catch (error) {
                console.log('Error occured: ', error);
            }
        }

        fetchLaborPyments();

        socket.on("payment_added", (newPayment) => {
            setPaymentData((prev) => [newPayment, ...prev]);
        });
        return () => socket.off("payment_added");
    }, []);

    return (
        <div className='main-clients'>
            <Sidebar />

            <div className="client-page">
                <div className="client-heading">
                    <h1>Labor</h1>

                    <button onClick={addClick}>Add</button>
                </div>

                <div className='client-list'>
                    <ul>
                        <li className='list-header'>
                            <span className='col'>Labor</span>
                            <span className='col'>Salary</span>
                            <span className='col-actions'>Options</span>
                        </li>

                        {laborData.map((item, index) => (
                            <li key={item.labor_id || index} className='client-listitem' onClick={() => laborClick(item.labor_name)}>
                                <span className='col'>{item.labor_name || <span style={{ color: 'red' }}>MISSING NAME</span>}</span>
                                <span className='col'>{item.salary || <span style={{ color: 'red' }}>MISSING SALARY</span>}</span>
                                <span className='col col-actions'>
                                    <button className='delete-btn'
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteLabor(item.labor_id);
                                        }}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="red">
                                            <path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 
                                    56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 
                                    0h80v-360h-80v360ZM280-720v520-520Z" />
                                        </svg>
                                    </button>
                                </span>
                            </li>
                        ))}
                    </  ul>
                </div>

                {showAdd && (
                    <div className='popup-overlay'>
                        <div className='add-popup'>
                            <div className='close-div'>
                                <button onClick={() => toggleShowAdd(false)} className="close-btn">
                                    &times;
                                </button>
                            </div>

                            <h2>Add Labor</h2>
                            <div className='add-div'>
                                <input placeholder='Labor Name'
                                    onChange={(e) => setLabor(e.target.value)} value={labor}></input>
                            </div>
                            <div className='add-div'>
                                <input placeholder='Salary'
                                    onChange={(e) => setSalary(e.target.value)} value={salary}></input>
                            </div>

                            <button className='add-btn' onClick={addLabor}>Add</button>
                        </div>
                    </div>
                )}

                {laborShow && (
                    <div className="popup-overlay">
                        <div className="purchase-popup">
                            <div className='close-div'>
                                <button onClick={() => toggleLaborShow(false)} className="close-btn">
                                    &times;
                                </button>
                            </div>

                            <div className="popup-header">
                                <h2>{laborName}</h2>

                                <div className="header-btns">
                                    <button className='header-add-btn' onClick={payClick}>
                                        Pay
                                    </button><button onClick={printPDF} className="download-btn" style={{ marginRight: '10px' }}>
                                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#808183">
                                            <path d="M640-640v-120H320v120h-80v-200h480v200h-80Zm-480 80h640-640Zm560 100q17 0 28.5-11.5T760-500q0-17-11.5-28.5T720-540q-17 0-28.5 11.5T680-500q0 17 11.5 28.5T720-460Zm-80 260v-160H320v160h320Zm80 80H240v-160H80v-240q0-33 23.5-56.5T160-600h640q33 0 56.5 23.5T880-520v240H720v160Zm80-240v-160q0-17-11.5-28.5T760-560H160q-17 0-28.5 11.5T120-520v160h120v-80h480v80h120Z" />
                                        </svg>
                                    </button>
                                    <button onClick={downloadPDF} className="download-btn">
                                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#808183"><path d="M440-800v487L216-537l-56 57 320 320 320-320-56-57-224 224v-487h-80Z" /></svg>
                                    </button>
                                </div>
                            </div>

                            <div className='client-list' ref={contentRef}>
                                <ul>
                                    <li className='list-header invoice-ledger'>
                                        <span className='col'>Date</span>
                                        <span className='col'>Description</span>
                                        <span className='col'>Amount</span>
                                        <span className='col'>Method</span>
                                    </li>

                                    {Array.isArray(paymentData) && paymentData.map((item, index) => (
                                        <li key={item.labor_payment_id || index} className='client-listitem invoice-ledger'>
                                            <span className='col'>{item.date || <span style={{ color: 'red' }}>MISSING Date</span>}</span>
                                            <span className='col'>{item.description || <span style={{ color: 'red' }}>MISSING DESCRIPTION</span>}</span>
                                            <span className='col'>{item.amount || 0}</span>
                                            <span className='col'>{item.method || <span style={{ color: 'red' }}>MISSING METHOD</span>}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                )}

                {showPay && (
                    <div className='popup-overlay'>
                        <div className='add-popup'>
                            <div className='close-div'>
                                <button onClick={() => toggleshowPay(false)} className="close-btn">
                                    &times;
                                </button>
                            </div>

                            <h2>New Payment</h2>
                            <div className='project-subtitle'>{laborName}</div>

                            <div className='add-div'>
                                <input
                                    placeholder='Amount'
                                    type="number"
                                    onChange={(e) => setAmount(e.target.value)}
                                    value={amount}
                                />
                            </div>

                            <div className='add-div'>
                                <input
                                    placeholder='Description'
                                    onChange={(e) => setDescription(e.target.value)}
                                    value={description}
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

                            <button className='add-btn' onClick={confirmPayment}>
                                Confirm Payment
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}