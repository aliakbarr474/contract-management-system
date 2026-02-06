import './clients.css'
import Sidebar from './Sidebar'
import { useEffect, useState } from "react";
import { socket } from './Socket'

export default function Expenses() {
    const [showAdd, toggleShowAdd] = useState(false);

    const [amount, setAmount] = useState('');
    const [project, setProject] = useState('');

    const [date, setDate] = useState(new Date());

    const [projectFetch, setProjectFetch] = useState([]);
    const [vendorFetch, setVendorFetch] = useState([]);

    const [expenseData, setExpenseData] = useState([]);

    const [type, setType] = useState('');
    const [method, setMethod] = useState('');
    const [vendor, setVendor] = useState('');

    const addClick = () => {
        toggleShowAdd(!showAdd)
    }

    const addExpense = async () => {
        if (!type || !amount || !project || !vendor || !method) {
            alert("Please fill in details properly");
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/expenses/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type, amount, project, vendor, method })
            })

            const result = await response.json();
            setExpenseData(prev => [
                ...prev,
                {
                    expense_id: result.expense_id,
                    type,
                    reference_name: type === 'project' ? project : vendor,
                    amount,
                    method,
                    date: new Date().toLocaleDateString('en-GB')
                }
            ])

        } catch (error) {
            console.log('Error occured: ', error);
        }

        setType('');
        setAmount('');
        setProject('');
        setVendor('');
        setMethod('');
        toggleShowAdd(false);
    }

    useEffect(() => {
        const fetchExpenses = async () => {
            try {
                const response = await fetch('http://localhost:5000/expenses/show');
                if (!response.ok) {
                    console.log('Error retrieving data');
                }

                const result = await response.json();
                setExpenseData(result);
            } catch (error) {
                console.log('Error occured: ', error);
            }
        }

        fetchExpenses();
    }, [])

    const deleteExpense = async (id) => {
        try {
            const response = await fetch(`http://localhost:5000/expenses/delete/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                setExpenseData(prev => prev.filter(item => item.expense_id !== id))
            } else {
                const errMsg = await response.text();
                console.log("Error deleting Expense:", errMsg);
            }
        } catch (error) {
            console.log('Error occured: ', error);
        }
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

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await fetch('http://localhost:5000/projects/show');
                if (!response.ok) {
                    console.log('Error retrieving data');
                }

                const result = await response.json();
                setProjectFetch(Array.isArray(result) ? result : result.data || []);
            } catch (error) {
                console.log('Error occured: ', error);
            }
        }

        fetchProjects();
    }, [])

    return (
        <div className='main-clients'>
            <Sidebar />

            <div className="client-page">
                <div className="client-heading">
                    <h1>Cash Out</h1>

                    <button onClick={addClick}>Add</button>
                </div>

                <div className='client-list'>
                    <ul>
                        <li className='list-header invoice-ledger'>
                            <span className='col'>Date</span>
                            <span className='col'>Type</span>
                            <span className='col'>Vendor/Project</span>
                            <span className='col'>Method</span>
                            <span className='col'>Amount</span>
                        </li>

                        {expenseData.map((item, index) => (
                            <li key={item.expense_id || index} className='client-listitem invoice-ledger'>
                                <span className='col'>{item.date || <span style={{ color: 'red' }}>MISSING DATE</span>}</span>
                                <span className='col'>{item.type || <span style={{ color: 'red' }}>MISSING TYPE</span>}</span>
                                <span className='col'>
                                    {item.reference_name || (
                                        <span style={{ color: 'red' }}>MISSING NAME</span>
                                    )}
                                </span>
                                <span className='col'>{item.method || <span style={{ color: 'red' }}>MISSING METHOD</span>}</span>
                                <span className='col'>{item.amount || <span style={{ color: 'red' }}>MISSING AMOUNT</span>}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {showAdd && (
                    <div className='popup-overlay'>
                        <div className='add-popup payment-popup'>
                            <div className='close-div'>
                                <button onClick={() => toggleShowAdd(false)} className="close-btn">
                                    &times;
                                </button>
                            </div>

                            <h2>New Payment</h2>

                            <div className='vendor-section payment-heading'>
                                <div className='vendor-dropdown-section'>
                                    <select name='payment-type' required className='vendor-dropdown'
                                        onChange={(e) => setType(e.target.value)} value={type}>
                                        <option value=''>Payment Type</option>
                                        <option value='project'>Project Payment</option>
                                        <option value='purchase'>Purchase Payment</option>
                                    </select>
                                </div>

                                {type === 'purchase' && (
                                    <div className='vendor-dropdown-section'>
                                        <select name='vendors' required className='vendor-dropdown' onChange={(e) => { setVendor(e.target.value) }
                                        }>
                                            <option value=''>Select Vendor</option>
                                            {vendorFetch.map((vendor) => (
                                                <option
                                                    key={vendor.vendor_id}
                                                    value={vendor.vendor_name}
                                                >
                                                    {vendor.vendor_name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {type === 'project' && (
                                    <div className='vendor-dropdown-section'>
                                        <select name='vendors' required className='vendor-dropdown' onChange={(e) => { setProject(e.target.value) }
                                        }>
                                            <option value=''>Select Project</option>
                                            {projectFetch.map((project) => (
                                                <option
                                                    key={project.project_id}
                                                    value={project.project_name}
                                                >
                                                    {project.project_name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <div className='invoice-section'>
                                    <h4>Amount</h4>
                                    <input placeholder='Amount' onChange={(e) => setAmount(e.target.value)} value={amount}></input>
                                </div>

                                <div className='vendor-dropdown-section'>
                                    <select name='payment-method' required className='vendor-dropdown'
                                        onChange={(e) => setMethod(e.target.value)} value={method}>
                                        <option value=''>Method</option>
                                        <option value='cheque'>Cheque</option>
                                        <option value='cash'>Cash</option>
                                        <option value='bank'>Bank Transfer</option>
                                    </select>
                                </div>

                                <div className='invoice-section'>
                                    <h4>Date:</h4>
                                    <h4>{date.toLocaleDateString()}</h4>
                                </div>
                            </div>

                            <button className='add-btn' onClick={addExpense}>Add</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}