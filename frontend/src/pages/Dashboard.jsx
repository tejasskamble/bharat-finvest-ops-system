import { useEffect, useMemo, useState } from 'react';
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import axiosInstance from '../api/axiosInstance';
import Navbar from '../components/Navbar';
import StatCard from '../components/StatCard';

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadStats = async () => {
      try {
        const { data } = await axiosInstance.get('/dashboard/stats');
        setStats(data);
        setError('');
      } catch (requestError) {
        setError(requestError.response?.data?.message || 'Unable to load dashboard data right now.');
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  const taskChartData = useMemo(() => {
    if (!stats) {
      return null;
    }

    return {
      labels: ['Pending', 'In Progress', 'Completed'],
      datasets: [
        {
          data: [stats.taskStats.pending, stats.taskStats.in_progress, stats.taskStats.completed],
          backgroundColor: ['#1a3c5e', '#2980b9', '#27ae60']
        }
      ]
    };
  }, [stats]);

  const attendanceChartData = useMemo(() => {
    if (!stats) {
      return null;
    }

    return {
      labels: ['Present/Half Day', 'Absent'],
      datasets: [
        {
          label: 'Today',
          data: [stats.attendanceToday.present, stats.attendanceToday.absent],
          backgroundColor: ['#27ae60', '#e74c3c']
        }
      ]
    };
  }, [stats]);

  if (loading) {
    return (
      <>
        <Navbar title="Dashboard" />
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '70vh' }}>
          <div className="spinner-border text-primary" role="status"></div>
        </div>
      </>
    );
  }

  if (!stats) {
    return (
      <>
        <Navbar title="Dashboard" />
        <div className="p-4">
          <div className="alert alert-danger mb-0">{error || 'Dashboard data is unavailable.'}</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar title="Dashboard" />
      <div className="p-4">
        {error ? <div className="alert alert-warning">{error}</div> : null}
        <div
          className="rounded mb-4 p-4 text-white"
          style={{
            backgroundImage: "linear-gradient(rgba(26,60,94,0.78), rgba(41,128,185,0.78)), url('/assets/images/finance-hero.jpg')",
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <h5 className="mb-1">Operations Snapshot</h5>
          <div style={{ fontSize: '14px' }}>Live operational overview for BharatFinvest teams.</div>
        </div>

        <div className="row g-3">
          <div className="col-md-6 col-xl-3">
            <StatCard title="Total Employees" value={stats.totalEmployees} icon="bi-people" colorClass="bg-primary" subtitle="Registered in portal" />
          </div>
          <div className="col-md-6 col-xl-3">
            <StatCard title="Active Employees" value={stats.activeEmployees} icon="bi-person-check" colorClass="bg-success" subtitle="Currently active" />
          </div>
          <div className="col-md-6 col-xl-3">
            <StatCard title="Total Tasks" value={stats.taskStats.total} icon="bi-list-task" colorClass="bg-info" subtitle="Across all departments" />
          </div>
          <div className="col-md-6 col-xl-3">
            <StatCard
              title="Attendance %"
              value={`${stats.attendancePercent}%`}
              icon="bi-calendar2-check"
              colorClass="bg-warning"
              subtitle="Based on today records"
            />
          </div>
        </div>

        <div className="row g-3 mt-1">
          <div className="col-lg-6">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white fw-semibold">Task Status Distribution</div>
              <div className="card-body" style={{ height: '300px' }}>
                {taskChartData && (
                  <Doughnut
                    data={taskChartData}
                    options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }}
                  />
                )}
              </div>
            </div>
          </div>
          <div className="col-lg-6">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white fw-semibold">Today's Attendance</div>
              <div className="card-body" style={{ height: '300px' }}>
                {attendanceChartData && (
                  <Bar
                    data={attendanceChartData}
                    options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
