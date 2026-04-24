import React, { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import '../scss/dashboard.scss'
import Sidebar from '../components/Sidebar.jsx'
import Mainbar from '../components/Mainbar.jsx'
import Header from '../components/Header.jsx'
import Testcomponent from '../components/Testcomponent.jsx'
import Transfercomponent from './Transfercomponent.jsx'
import Toolscomponent from './Toolscomponent.jsx'
import CloseTestesComponent from './CloseTestesComponent.jsx'
import ExtenguisLiquidsComponent from './ExtenguisLiquidsComponent.jsx'
import GenericDatas from './GenericDatas.jsx'
import Literature from './Literature.jsx'
import ArchivePage from './ArchivePage.jsx'
import Home from './Home.jsx'
import GeneralRequirements from './GeneralRequirements.jsx'
import EventsPage from './EventsPage.jsx'
import EventHistoryPage from './EventHistoryPage.jsx'
import SurveysPage from './SurveysPage.jsx'
import SurveyPage from './SurveyPage.jsx'

const Dashboard = () => {
    const { selectedBrigade } = useAuth()
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen)
    }

    return (
        <div className="dashboard-wrapper">
            <Header toggleSidebar={toggleSidebar} />

            <div className="dashboard-main">
                {/* Overlay for mobile clicking outside to close */}
                {isSidebarOpen && (
                    <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>
                )}

                <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

                <Routes>
                    <Route element={<Mainbar />}>
                        <Route index element={<Home />} />
                        <Route path="/nextTestes" element={<CloseTestesComponent selectedBrigade={selectedBrigade} />} />
                        <Route path="/tests" element={<Testcomponent selectedBrigade={selectedBrigade} />} />
                        <Route path="/transfer" element={<Transfercomponent selectedBrigade={selectedBrigade} />} />
                        <Route path="/tools" element={<Toolscomponent selectedBrigade={selectedBrigade} />} />
                        <Route path="/extenguisLiquids" element={<ExtenguisLiquidsComponent selectedBrigade={selectedBrigade} />} />
                        <Route path="/genericDatas" element={<GenericDatas selectedBrigade={selectedBrigade} />} />
                        <Route path="/literature" element={<Literature/>} />
                        <Route path="/archives" element={<ArchivePage />} />
                        <Route path="/tool-requierments" element={<GeneralRequirements selectedBrigade={selectedBrigade} />} />
                        <Route path="/events" element={<EventsPage />} />
                        <Route path="/events/history" element={<EventHistoryPage />} />
                        <Route path="/events/:eventId/history" element={<EventHistoryPage />} />
                        <Route path="/surveys" element={<SurveysPage />} />
                        <Route path="/surveys/:id" element={<SurveyPage />} />
                    </Route>
                </Routes>
            </div>
        </div>
    )
}

export default Dashboard
