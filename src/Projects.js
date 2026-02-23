import { useEffect, useState, useRef } from "react";
import Sidebar from "./Sidebar";
import './clients.css'
import html2pdf from 'html2pdf.js';
import { socket } from "./Socket";

export default function Projects() {
    const contentRef = useRef();

    const [showAdd, toggleShowAdd] = useState(false);
    const [projectShow, toggleProjectShow] = useState(false);
    const [payProject, togglePayProject] = useState(false);
    const [receiveProject, toggleReceiveProject] = useState(false);

    const [projectName, setProjectName] = useState('');
    const [clientName, setClientName] = useState('');
    const [advance, setAdvance] = useState(0);

    const [clientFetch, setClientFetch] = useState([]);
    const [projectData, setProjectData] = useState([]);

    const [projectId, setProjectId] = useState('');
    const [projectClickName, setProjectClickName] = useState('');
    const [projectLedger, setProjectLedger] = useState([]);

    const [amount, setAmount] = useState('');
    const [method, setMethod] = useState('');
    const [date, setDate] = useState(new Date());
    const [expenseData, setExpenseData] = useState([]);

    const addClick = () => {
        toggleShowAdd(!showAdd);
    }

    const payClick = () => {
        togglePayProject(!payProject);
    }

    const receiveClick = () => {
        toggleReceiveProject(!receiveProject);
    }

    const downloadPDF = () => {
        const element = contentRef.current;
        const options = {
            margin: 10,
            filename: `${projectClickName}_Ledger.pdf`,
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
            filename: `${projectClickName}_Ledger.pdf`,
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
        const fetchData = async () => {
            try {
                const response = await fetch('https://cms-backend-production.up.railway.app/clients/show');
                if (!response.ok) {
                    console.log('Error retrieving data');
                    return;
                }

                const result = await response.json();
                setClientFetch(result);
            } catch (error) {
                console.log('Error occurred: ', error);
            }
        };

        fetchData();
    }, []);

    const addProject = async () => {
        if (!projectName || !clientName || !advance) {
            alert("Please fill in Details");
            return;
        }

        try {
            const response = await fetch('https://cms-backend-production.up.railway.app/projects/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ projectName, clientName, advance })
            })

            const result = await response.json();

            setProjectData(prev => [
                ...prev,
                {
                    project_id: result.insertId,
                    client_name: result.client_name,
                    project_name: result.project_name,
                    advance: result.advance
                }
            ]);

        } catch (error) {
            console.log('Error occured: ', error);
        }

        setProjectName('');
        setClientName('');
        setAdvance(0);
    }

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await fetch('https://cms-backend-production.up.railway.app/projects/show');
                if (!response.ok) {
                    console.log('Error retrieving data');
                }

                const result = await response.json();
                setProjectData(Array.isArray(result) ? result : result.data || []);
            } catch (error) {
                console.log('Error occured: ', error);
            }
        }

        fetchProjects();
        socket.on('projectUpdated', fetchProjects);
        return () => socket.off('projectUpdated', fetchProjects);

    }, [])

    const projectClick = (id, name) => {
        toggleProjectShow(!projectShow);
        setProjectId(id);
        setProjectClickName(name);
    }

    const addExpense = async () => {
        const type = 'project';
        const vendor = '';

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
                    project: projectClickName,
                    vendor,
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
                    reference_name: projectClickName,
                    amount,
                    method,
                    date: new Date().toLocaleDateString('en-GB')
                }
            ]);

        } catch (error) {
            console.log('Error occured: ', error);
        }

        setAmount('');
        setMethod('');
        togglePayProject(false);
    }

    const addPayment = async () => {
        const project = projectClickName;

        if (!amount || !method) {
            alert("Please fill in Amount and Method");
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
        toggleReceiveProject(false);
    };

    useEffect(() => {
        if (projectId) {
            const fetchProjectLedger = async () => {
                const response = await fetch(`https://cms-backend-production.up.railway.app/project/ledger/show/${projectId}`)
                if (!response.ok) {
                    console.log('Error retrieving data')
                }
                const result = await response.json()
                setProjectLedger(result)
            }

            fetchProjectLedger()

            socket.emit('join-project-ledger', projectId)

            socket.on('project-ledger-updated', fetchProjectLedger)

            return () => {
                socket.off('project-ledger-updated', fetchProjectLedger)
            }
        }
    }, [projectId]);


    return (
        <div className="main-clients">
            <Sidebar />

            <div className="client-page">
                <div className="client-heading">
                    <h1>Projects</h1>

                    <button onClick={addClick}>Add</button>
                </div>

                <div className='client-list'>
                    <ul>
                        <li className='list-header'>
                            <span className='col'>Project</span>
                            <span className='col'>Client</span>
                            <span className='col'>Balance</span>
                        </li>

                        {projectData.map((item, index) => (
                            <li key={item.project_id || index} className='client-listitem' onClick={() => projectClick(item.project_id, item.project_name)}>

                                <span className='col'>
                                    {item.project_name || <span style={{ color: 'red' }}>MISSING NAME</span>}
                                </span>

                                <span className='col'>
                                    {item.client_name || <span style={{ color: 'red' }}>MISSING CLIENT</span>}
                                </span>

                                <span className='col' style={{ fontWeight: 'bold' }}>
                                    {item.current_balance ? item.current_balance.toLocaleString() : '0'}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>

                {projectShow && (
                    <div className="popup-overlay">
                        <div className="purchase-popup">
                            <div className='close-div'>
                                <button onClick={() => toggleProjectShow(false)} className="close-btn">
                                    &times;
                                </button>
                            </div>

                            <div className="popup-header">
                                <h2>{projectClickName}</h2>

                                <div className="header-btns">
                                    <button className='header-add-btn' onClick={payClick}>
                                        Pay
                                    </button>
                                    <button className='header-add-btn' onClick={receiveClick}>
                                        Recieve
                                    </button>

                                    <button onClick={printPDF} className="download-btn" style={{ marginRight: '10px' }}>
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
                                        <span className='col'>Credit</span>
                                        <span className='col'>Debit</span>
                                        <span className='col'>Balance</span>
                                    </li>

                                    {Array.isArray(projectLedger) && projectLedger.map((item, index) => (
                                        <li key={item.project_ledger_id || index} className='client-listitem invoice-ledger'>
                                            <span className='col'>{item.date || <span style={{ color: 'red' }}>MISSING PRODUCT</span>}</span>
                                            <span className='col'>{item.description || <span style={{ color: 'red' }}>MISSING QUANTITY</span>}</span>
                                            <span className='col'>{item.credit || 0}</span>
                                            <span className='col'>{item.debit || 0}</span>
                                            <span className='col'>{item.balance || 0}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                )}

                {showAdd && (
                    <div className='popup-overlay'>
                        <div className='add-popup'>
                            <div className='close-div'>
                                <button onClick={() => toggleShowAdd(false)} className="close-btn">
                                    &times;
                                </button>
                            </div>

                            <h2>Add Project</h2>
                            <div className='add-div'>
                                <input placeholder='Project Name'
                                    onChange={(e) => setProjectName(e.target.value)} value={projectName}></input>
                            </div>
                            <select name="departments" required className="client-dropdown" onChange={(e) => setClientName(e.target.value)}>
                                <option value="">Select Client</option>
                                {clientFetch.map((client) => (
                                    <option
                                        key={client.client_id}
                                        value={client.client_name}
                                    >
                                        {client.client_name}
                                    </option>
                                ))}
                            </select>
                            <div className='add-div'>
                                <input placeholder='Advance'
                                    onChange={(e) => setAdvance(e.target.value)} value={advance}></input>
                            </div>

                            <button className='add-btn' onClick={addProject}>Add</button>
                        </div>
                    </div>
                )}

                {receiveProject && (
                    <div>
                        <div className='popup-overlay'>
                            <div className='add-popup'>
                                <div className='close-div'>
                                    <button onClick={() => toggleReceiveProject(false)} className="close-btn">
                                        &times;
                                    </button>
                                </div>

                                <h2>New Payment</h2>
                                <div className='project-subtitle'>{projectClickName}</div>

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

                                <button className='add-btn' onClick={addPayment}>
                                    Confirm Payment
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {payProject && (
                    <div className='popup-overlay'>
                        <div className='add-popup'>
                            <div className='close-div'>
                                <button onClick={() => togglePayProject(false)} className="close-btn">
                                    &times;
                                </button>
                            </div>

                            <h2>New Payment</h2>
                            <div className='project-subtitle'>{projectClickName}</div>

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
        </div>
    )
}