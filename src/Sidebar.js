import { Link, useLocation } from 'react-router-dom'
import './sidebar.css'
import { useState } from 'react'

export default function Sidebar() {
    const [showAccounts, setShowAccounts] = useState(false)
    const location = useLocation();

    const isActive = (path) => location.pathname === path ? 'active' : '';

    return (
        <div className='main-sidebar'>
            <ul>
                <li>
                    <Link to='/dashboard' className={isActive('/dashboard')}>
                        <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="currentColor">
                            <path d="M528-624v-192h288v192H528ZM144-432v-384h288v384H144Zm384 288v-384h288v384H528Zm-384 0v-192h288v192H144Zm72-360h144v-240H216v240Zm384 288h144v-240H600v240Zm0-479h144v-49H600v49ZM216-216h144v-48H216v48Zm144-288Zm240-191Zm0 239ZM360-264Z" />
                        </svg>
                        Dashboard
                    </Link>
                </li>
                <li>
                    <Link to='/clients' className={isActive('/clients')}>
                        <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="currentColor">
                            <path d="M480-480q-60 0-102-42t-42-102q0-60 42-102t102-42q60 0 102 42t42 102q0 60-42 102t-102 42ZM192-192v-96q0-23 12.5-43.5T239-366q55-32 116.29-49 61.29-17 124.5-17t124.71 17Q666-398 721-366q22 13 34.5 34t12.5 44v96H192Zm72-72h432v-24q0-5.18-3.03-9.41-3.02-4.24-7.97-6.59-46-28-98-42t-107-14q-55 0-107 14t-98 42q-5 4-8 7.72-3 3.73-3 8.28v24Zm216.21-288Q510-552 531-573.21t21-51Q552-654 530.79-675t-51-21Q450-696 429-674.79t-21 51Q408-594 429.21-573t51 21Zm-.21-72Zm0 360Z" />
                        </svg>
                        Clients
                    </Link>
                </li>
                <li>
                    <Link to='/projects' className={isActive('/projects')}>
                        <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="currentColor">
                            <path d="M192-216v-192h240v192-192H192v192Zm488-339ZM48-144v-384l264-192 259 188q-11 14-23 27.5T525-477L312-631 120-492v276h72v-192h240v264h-72v-192h-96v192H48Zm864-672v396q-16-18-34-31t-38-24.08V-744H480v57l-72-52v-77h504ZM696-600h72v-72h-72v72Zm23.77 552Q640-48 584-104.23q-56-56.22-56-136Q528-320 584.23-376q56.22-56 136-56Q800-432 856-375.77q56 56.22 56 136Q912-160 855.77-104q-56.22 56-136 56ZM696-144h48v-72h72v-48h-72v-72h-48v72h-72v48h72v72Z" />
                        </svg>
                        Projects
                    </Link>
                </li>
                <li>
                    <Link to='/labor' className={isActive('/labor')}>
                        <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="currentColor">
                            <path d="M96-144v-92q0-26 12.5-47.5T143-318q54-32 114.5-49T384-384q66 0 126.5 17T625-318q22 13 34.5 34.5T672-236v92H96Zm72-72h432v-20q0-6.47-3.03-11.76-3.02-5.3-7.97-8.24-47-27-99-41.5T384-312q-54 0-106 14t-99 42q-4.95 2.83-7.98 7.91-3.02 5.09-3.02 12V-216Zm216-216q-60 0-102-42t-42-102h-12q-5.4 0-8.7-3.3-3.3-3.3-3.3-8.7 0-5.4 3.3-8.7 3.3-3.3 8.7-3.3h12q0-40 19.8-72.52Q279.6-705.03 312-724v64q0 5.4 3.3 8.7 3.3 3.3 8.7 3.3 5.4 0 8.7-3.3 3.3-3.3 3.3-8.7v-74.84q11-4.16 22.9-6.66 11.91-2.5 25-2.5 13.1 0 25.1 2.5 12 2.5 23 6.66V-660q0 5.4 3.3 8.7 3.3 3.3 8.7 3.3 5.4 0 8.7-3.3 3.3-3.3 3.3-8.7v-64q32.4 18.87 52.2 51.22Q528-640.43 528-600h12q5.4 0 8.7 3.3 3.3 3.3 3.3 8.7 0 5.4-3.3 8.7-3.3 3.3-8.7 3.3h-12q0 60-42 102t-102 42Zm.21-72Q414-504 435-525.15T456-576H312q0 30 21.21 51t51 21Zm261.94 120-5.07-25.31Q636-411 631.5-414q-4.5-3-8.5-6l-24 9-17-30 19-15.65q0-2.35-.5-5.35-.5-3-.5-6t.5-6q.5-3 .5-5.35L582-495l17-30 24 9q4-3 8.67-6 4.66-3 9.33-5l5.09-25H680l4 25q5 2 10 5t9 6l24-9 17 30-19 15.65q0 2.35.5 5.35.5 3 .5 6t-.5 6q-.5 3-.5 5.35L744-441l-17 30-24-9q-4 3-8.85 5.86-4.86 2.85-10.15 5.14l-4 25h-33.85ZM663-443q11 0 18-7t7-18q0-11-7-18t-18-7q-11 0-18.5 7t-7.5 18q0 11 7.5 18t18.5 7Zm81-133-7-37q-8-2-14-6t-12-9l-35 12-24-42 28-24q-1-4-1.5-7t-.5-7q0-4 .5-7.5t1.5-7.5l-28-24 24-42 35 12q6-5 12-9t14-6l6.88-36H792l8 36q8 2 14 6t12 9l34-12 24 42-27 24q1 4 1 7.5v7.5q0 4-.5 7.5T856-681l28 24-24 42-35-12q-6 5-12 9t-14 6l-6.87 36H744Zm23.96-77q18.04 0 30.54-12.46t12.5-30.5q0-18.04-12.46-30.54t-30.5-12.5q-18.04 0-30.54 12.46t-12.5 30.5q0 18.04 12.46 30.54t30.5 12.5ZM384-216Z" />
                        </svg>
                        Labor
                    </Link>
                </li>
                <li>
                    <Link to='/vendors' className={isActive('/vendors')}>
                        <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="currentColor">
                            <path d="M80-80v-481l280-119v80l200-80v120h320v480H80Zm80-80h640v-320H480v-82l-200 80v-78l-120 53v347Zm280-80h80v-160h-80v160Zm-160 0h80v-160h-80v160Zm320 0h80v-160h-80v160Zm280-320H680l40-320h120l40 320ZM160-160h640-640Z" />
                        </svg>
                        Vendors
                    </Link>
                </li>
                <li>
                    <Link to='/purchases' className={isActive('/purchases')}>
                        <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="currentColor">
                            <path d="M120-80v-800l60 60 60-60 60 60 60-60 60 60 60-60 60 60 60-60 60 60 60-60 60 60 60-60v800l-60-60-60 60-60-60-60 60-60-60-60 60-60-60-60 60-60-60-60 60-60-60-60 60Zm120-200h480v-80H240v80Zm0-160h480v-80H240v80Zm0-160h480v-80H240v80Zm-40 404h560v-568H200v568Zm0-568v568-568Z" />
                        </svg>
                        Purchases
                    </Link>
                </li>
                <li className="accounts-wrapper">
                    <button
                        className={`accounts-btn ${showAccounts ? 'open' : ''}`}
                        onClick={() => setShowAccounts(prev => !prev)}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="currentColor">
                            <path d="M200-120q-33 0-56.5-23.5T120-200v-640h80v640h640v80H200Zm40-120v-360h160v360H240Zm200 0v-560h160v560H440Zm200 0v-200h160v200H640Z" />
                        </svg>
                        Accounts
                    </button>

                    {showAccounts && (
                        <div className="accounts-dropdown">
                            <Link to="/payments" className={isActive('/payments')}>
                                <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="currentColor">
                                    <path d="M200-200v-400h80v264l464-464 56 56-464 464h264v80H200Z" />
                                </svg>
                                Cash In
                            </Link>
                            <Link to="/expenses" className={isActive('/expenses')}>
                                <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="currentColor">
                                    <path d="m216-160-56-56 464-464H360v-80h400v400h-80v-264L216-160Z" />
                                </svg>
                                Cash Out
                            </Link>
                        </div>
                    )}
                </li>
            </ul>
        </div>
    )
}