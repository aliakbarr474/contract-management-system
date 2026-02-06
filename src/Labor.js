import { useEffect, useState } from 'react'
import './clients.css'
import Sidebar from './Sidebar'

export default function Labor(){
    const [showAdd,toggleShowAdd] = useState(false);
    const [labor, setLabor] = useState('');
    const [salary, setSalary] = useState('');
    const [laborData,setLaborData] = useState([]);

    const addClick = () => {
        toggleShowAdd(!showAdd)
    }

    const addLabor = async () => {
        if (!labor || !salary) {
            alert("Please fill in details properly");
            return;
        }


        try {
            const response = await fetch('http://localhost:5000/labor/add', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({labor,salary})
            })

            const result = await response.json();
            setLaborData(prev => [
                ...prev,
                {labor_id: result.insertId, labor_name: result.labor_name, salary: result.salary}
            ])
        } catch (error) {
            console.log('Error occured: ', error);    
        }

        setLabor('');
        setSalary('');
    }

    useEffect (() => {
        const fetchLabor = async () => {
            try {
                const response = await fetch('http://localhost:5000/labor/show');
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
            const response = await fetch(`http://localhost:5000/labor/delete/${id}`, {
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
                          <li key={item.labor_id || index} className='client-listitem'>
                            <span className='col'>{item.labor_name || <span style={{ color: 'red' }}>MISSING NAME</span>}</span>
                            <span className='col'>{item.salary || <span style={{ color: 'red' }}>MISSING SALARY</span>}</span>
                            <span className='col col-actions'>
                                <button className='delete-btn' onClick={() => deleteLabor(item.labor_id)}>
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
            </div>
        </div>
    )
}