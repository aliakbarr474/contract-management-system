import { useEffect, useState } from "react"
import Sidebar from "./Sidebar"
import { useNavigate } from "react-router"

export default function Dashboard() {
    const [totalPayable, setTotalPayable] = useState(0);
    const [totalReceivable, setTotalReceivable] = useState(0);
    const [activeProjects, setActiveProjects] = useState(0);
    const [pendingInvoices, setPendingInvoices] = useState([]);
    const [recentActivity, setRecentActivity] = useState([]);

    const [user, setUser] = useState('');
    const navigate = useNavigate();
    const [showLogout, setShowLogout] = useState(false);

    useEffect(() => {
        const getUsername = async () => {
            const loggedInUser = localStorage.getItem('username');
            if (!loggedInUser) {
                navigate('/');
            } else {
                const capitalized = loggedInUser.charAt(0).toUpperCase() + loggedInUser.slice(1);
                setUser(capitalized);
            }
        }
        getUsername();
    }, [navigate])

    const togglePopup = () => {
        setShowLogout(!showLogout);
    }

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        navigate('/', { replace: true });
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const payableRes = await fetch('http://localhost:5000/vendors/total-balance');
                const payableData = await payableRes.json();
                setTotalPayable(payableData.total_balance || 0);

                const receiveRes = await fetch('http://localhost:5000/projects/total-receivable');
                const receiveData = await receiveRes.json();
                setTotalReceivable(receiveData.total_receivable || 0);

                const activeRes = await fetch('http://localhost:5000/projects/active-this-year');
                const activeData = await activeRes.json();
                setActiveProjects(activeData.project_count || 0);

                const invoiceRes = await fetch('http://localhost:5000/dashboard/pending-invoices');
                const invoiceData = await invoiceRes.json();
                setPendingInvoices(invoiceData);

                const activityRes = await fetch('http://localhost:5000/dashboard/recent-activity');
                const activityData = await activityRes.json();
                setRecentActivity(activityData);

            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            }
        };

        fetchData();
    }, []);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
    };

    return (
        <div className="main-clients">
            <Sidebar />

            <div className="client-page">
                <div className="client-heading">
                    <h1>Dashboard</h1>

                    <div className="side-heading" style={{ position: 'relative' }}>
                        <p>Hi, {user}</p>

                        <svg
                            className="user-icon"
                            onClick={togglePopup}
                            xmlns="http://www.w3.org/2000/svg"
                            height="30px"
                            viewBox="0 -960 960 960"
                            width="30px"
                            fill="#808183"
                            style={{ cursor: 'pointer' }}
                        >
                            <path d="M234-276q51-39 114-61.5T480-360q69 0 132 22.5T726-276q35-41 54.5-93T800-480q0-133-93.5-226.5T480-800q-133 0-226.5 93.5T160-480q0 59 19.5 111t54.5 93Zm146.5-204.5Q340-521 340-580t40.5-99.5Q421-720 480-720t99.5 40.5Q620-639 620-580t-40.5 99.5Q539-440 480-440t-99.5-40.5ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm100-95.5q47-15.5 86-44.5-39-29-86-44.5T480-280q-53 0-100 15.5T294-220q39 29 86 44.5T480-160q53 0 100-15.5ZM523-537q17-17 17-43t-17-43q-17-17-43-17t-43 17q-17 17-17 43t17 43q17 17 43 17t43-17Zm-43-43Zm0 360Z" />
                        </svg>

                        {showLogout && (
                            <div className="logout-popup">
                                <button onClick={handleLogout}>Logout</button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="dashboard-summary-area">
                    <div className="summary-box">
                        <div className="upper-summary">
                            <div className="icon-wrapper receivable">
                                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#808183"><path d="M441-120v-86q-53-12-91.5-46T293-348l74-30q15 48 44.5 73t77.5 25q41 0 69.5-18.5T587-356q0-35-22-55.5T463-458q-86-27-118-64.5T313-614q0-65 42-101t86-41v-84h80v84q50 8 82.5 36.5T651-650l-74 32q-12-32-34-48t-60-16q-44 0-67 19.5T393-614q0 33 30 52t104 40q69 20 104.5 63.5T667-358q0 71-42 108t-104 46v84h-80Z" /></svg>
                            </div>
                            <h3>Total Balance</h3>
                        </div>
                        <div className="summary-value">
                            Rs. {totalReceivable.toLocaleString()}
                        </div>
                    </div>

                    <div className="summary-box">
                        <div className="upper-summary">
                            <div className="icon-wrapper">
                                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#ef4444">
                                    <path d="M574-618q-12-30-35.5-47T482-682q-18 0-35 5t-31 19l-58-58q14-14 38-25.5t44-14.5v-84h80v82q45 9 79 36.5t51 71.5l-76 32ZM792-56 608-240q-15 15-41 24.5T520-204v84h-80v-86q-56-14-93.5-51T292-350l80-32q12 42 40.5 72t75.5 30q18 0 33-4.5t29-13.5L56-792l56-56 736 736-56 56Z" />
                                </svg>
                            </div>
                            <h3>Total Payable</h3>
                        </div>
                        <div className="summary-value">
                            Rs. {totalPayable.toLocaleString()}
                        </div>
                    </div>

                    <div className="summary-box">
                        <div className="upper-summary">
                            <div className="icon-wrapper projects">
                                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px">
                                    <path d="M160-120q-33 0-56.5-23.5T80-200v-440q0-33 23.5-56.5T160-720h160v-80q0-33 23.5-56.5T400-880h160q33 0 56.5 23.5T640-800v80h160q33 0 56.5 23.5T880-640v440q0 33-23.5 56.5T800-120H160Zm0-80h640v-440H160v440Zm240-520h160v-80H400v80ZM160-200v-440 440Z" />
                                </svg>
                            </div>
                            <h3>Active Projects ({new Date().getFullYear()})</h3>
                        </div>
                        <div className="summary-value">
                            {activeProjects}
                        </div>
                    </div>
                </div>

                <div className="dashboard-grid">
                    <div className="dashboard-card large">
                        <div className="card-header">
                            <h3>Pending Vendor Invoices</h3>
                            <button className="view-all-btn" onClick={() => navigate('/vendors')}>View All</button>
                        </div>
                        <table className="dashboard-table">
                            <thead>
                                <tr>
                                    <th>Vendor</th>
                                    <th>Invoice #</th>
                                    <th>Date</th>
                                    <th className="text-right">Balance</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pendingInvoices.length > 0 ? pendingInvoices.map((inv, index) => (
                                    <tr key={index}>
                                        <td>{inv.vendor_name}</td>
                                        <td>{inv.invoice_number || 'N/A'}</td>
                                        <td>{formatDate(inv.invoice_date)}</td>
                                        <td className="text-right amount-red">Rs. {inv.balance.toLocaleString()}</td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan="4" className="text-center">No pending invoices</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="dashboard-card large">
                        <div className="card-header">
                            <h3>Recent Activity</h3>
                        </div>
                        <table className="dashboard-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Description</th>
                                    <th>Type</th>
                                    <th className="text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentActivity.length > 0 ? recentActivity.map((item, index) => (
                                    <tr key={index}>
                                        <td>{formatDate(item.date)}</td>
                                        <td className="desc-cell">{item.description}</td>
                                        <td>
                                            <span className={`badge ${item.type === 'Project' ? 'badge-blue' : 'badge-orange'}`}>
                                                {item.type}
                                            </span>
                                        </td>
                                        <td className={`text-right ${item.credit > 0 ? 'amount-green' : 'amount-red'}`}>
                                            Rs. {(item.credit || item.debit).toLocaleString()}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan="4" className="text-center">No recent activity</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}