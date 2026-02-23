import { useEffect, useState } from "react"
import './clients.css';
import Sidebar from "./Sidebar";
import { socket } from './Socket'


export default function Payments() {
    const [showAdd, toggleShowAdd] = useState(false);

    const [project, setProject] = useState('');
    const [amount, setAmount] = useState('');
    const [method, setMethod] = useState('');

    const [projectFetch, setProjectFetch] = useState([]);


    const [paymentData, setPaymentData] = useState([]);

    const addClick = () => {
        toggleShowAdd(!showAdd)
    }

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('https://cms-backend-production.up.railway.app/projects/show');
                if (!response.ok) {
                    console.log('Error retrieving data');
                    return;
                }

                const result = await response.json();
                setProjectFetch(result);
            } catch (error) {
                console.log('Error occurred: ', error);
            }
        };

        fetchData();
    }, []);

    const addPayment = async () => {
        if (!project || !amount || !method) {
            alert("Please fill in details properly");
            return;
        }

        try {
            await fetch('https://cms-backend-production.up.railway.app/payments/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ project, amount, method })
            });
        } catch (error) {
            console.log('Error occurred: ', error);
        }

        setAmount('');
        setMethod('');
        toggleShowAdd(false);
    };


    useEffect(() => {
        const fetchPayments = async () => {
            try {
                const response = await fetch('https://cms-backend-production.up.railway.app/payments/show');
                if (!response.ok) {
                    console.log('Error retrieving data');
                }

                const result = await response.json();
                setPaymentData(result);
            } catch (error) {
                console.log('Error occured: ', error);
            }
        };

        fetchPayments();
        socket.on('paymentUpdated', () => {
            console.log('socket event received');
            fetchPayments();
        });

        return () => {
            socket.off('paymentUpdated');
        }
    }, []);

    const deletePayment = async (id) => {
        try {
            const response = await fetch(`https://cms-backend-production.up.railway.app/payments/delete/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                setPaymentData(prev => prev.filter(item => item.payment_id !== id))
            } else {
                const errMsg = await response.text();
                console.log("Error deleting Payment:", errMsg);
            }
        } catch (error) {
            console.log('Error occured: ', error);
        }
    }

    return (
        <div className="main-clients">
            <Sidebar />

            <div className="client-page">
                <div className="client-heading">
                    <h1>Cash In</h1>

                    <button onClick={addClick}>Add</button>
                </div>

                <div className='client-list'>
                    <ul>
                        <li className='list-header invoice-ledger'>
                            <span className='col'>Date</span>
                            <span className='col'>Project</span>
                            <span className='col'>Method</span>
                            <span className='col'>Amount</span>
                        </li>

                        {Array.isArray(paymentData) && paymentData.map((item, index) => (
                            <li key={item.payment_id || index} className='client-listitem invoice-ledger'>
                                <span className='col'>
                                    {item.date || <span style={{ color: 'red' }}>MISSING DATE</span>}
                                </span>
                                <span className='col'>
                                    {item.project_name || <span style={{ color: 'red' }}>MISSING PROJECT</span>}
                                </span>
                                <span className='col'>
                                    {item.method || <span style={{ color: 'red' }}>MISSING METHOD</span>}
                                </span>
                                <span className='col'>
                                    {item.amount !== undefined ? item.amount : <span style={{ color: 'red' }}>MISSING AMOUNT</span>}
                                </span>


                            </li>
                        ))}
                    </ul>

                </div>

                {showAdd && (
                    <div className='popup-overlay'>
                        <div className='add-popup'>
                            <div className='close-div'>
                                <button onClick={() => toggleShowAdd(false)} className="close-btn">
                                    &times;
                                </button>
                            </div>

                            <h2>Add Payment</h2>
                            <select name="departments" required className="client-dropdown" onChange={(e) => setProject(e.target.value)}>
                                <option value="">Select Project</option>
                                {projectFetch.map((project) => (
                                    <option
                                        key={project.project_id}
                                        value={project.project_name}
                                    >
                                        {project.project_name} / {project.client_name}
                                    </option>
                                ))}
                            </select>

                            <select name="method" className="client-dropdown" onChange={(e) => setMethod(e.target.value)}>
                                <option value=''>Select Method</option>
                                <option>Cash</option>
                                <option>Cheque</option>
                                <option>Bank Transfer</option>
                            </select>

                            <div className='add-div'>
                                <input placeholder='Amount' onChange={(e) => setAmount(e.target.value)} value={amount}></input>
                            </div>

                            <button className='add-btn' onClick={addPayment}>Add</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}