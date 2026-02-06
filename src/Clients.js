import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import './clients.css'

export default function Clients(){
    const [showAdd,toggleShowAdd] = useState(false);
    const [client, setClient] = useState('');
    const [clientPhone, setClientPhone] = useState('');
    const [clientData, setClientData] = useState([]);

    const addClick = () => {
        toggleShowAdd(!showAdd)
    }

    const addClient = async () => {
        if (!client || !clientPhone) {
            alert("Please fill in details properly");
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/clients/add', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({client,clientPhone})
            })

            const result = await response.json();
            setClientData(prev => [
                ...prev,
                {client_id: result.insertId, client_name: result.client_name, phone: result.phone}
            ])
        } catch (error) {
            console.log('Error occured: ', error);    
        }

        setClient('');
        setClientPhone('');
    }

    useEffect (() => {
        const fetchClients = async () => {
            try {
                const response = await fetch('http://localhost:5000/clients/show');
                if (!response.ok) {
                    console.log('Error retreiving clients');
                }
                const result = await response.json();
                setClientData(result);
            } catch (error) {
                console.log('Error occured: ', error);
            }
        } 
        fetchClients();
    }, [])

    const deleteClient = async (id) => {
        try {
            const response = await fetch(`http://localhost:5000/clients/delete/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                setClientData(prev => prev.filter(item => item.client_id !== id))
            } else {
                const errMsg = await response.text();
                console.log("Error deleting Client:", errMsg);
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
                    <h1>Clients</h1>

                    <button onClick={addClick}>Add</button>
                </div>

                <div className='client-list'>
                    <ul>
                        <li className='list-header'>
                            <span className='col'>Client</span>
                            <span className='col'>Phone</span>
                            <span className='col-actions'>Options</span>
                        </li>
                        
                        {clientData.map((item, index) => (
                          <li key={item.client_id || index} className='client-listitem'>
                            <span className='col'>{item.client_name || <span style={{ color: 'red' }}>MISSING NAME</span>}</span>
                            <span className='col'>{item.phone || <span style={{ color: 'red' }}>MISSING PHONE</span>}</span>
                            <span className='col col-actions'>
                                <button className='delete-btn' onClick={() => deleteClient(item.client_id)}>
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

                {showAdd && (
                    <div className='popup-overlay'>
                        <div className='add-popup'>
                            <div className='close-div'>
                                <button onClick={() => toggleShowAdd(false)} className="close-btn">
                                &times;
                                </button>
                            </div>

                            <h2>Add Client</h2>
                            <div className='add-div'>
                                <input placeholder='Client Name'
                                onChange={(e) => setClient(e.target.value)} value={client}></input>
                            </div>
                            <div className='add-div'>
                                <input placeholder='Phone Number'
                                onChange={(e) => setClientPhone(e.target.value)} value={clientPhone}></input>
                            </div>

                            <button className='add-btn' onClick={addClient}>Add</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}