import { useEffect, useMemo, useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import axiosInstance from '../api/axiosInstance';
import Navbar from '../components/Navbar';

const formatDateValue = (value) => {
  if (!value) {
    return '';
  }
  if (typeof value === 'string') {
    return value.substring(0, 10);
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10);
};

const Reports = () => {
  const [employees, setEmployees] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [attendanceSummary, setAttendanceSummary] = useState([]);
  const [logoBase64, setLogoBase64] = useState('');

  useEffect(() => {
    const loadData = async () => {
      const [employeeRes, taskRes, attendanceRes] = await Promise.all([
        axiosInstance.get('/employees?page=1&limit=200'),
        axiosInstance.get('/tasks'),
        axiosInstance.get('/attendance/summary')
      ]);

      setEmployees(employeeRes.data.data);
      setTasks(taskRes.data);
      setAttendanceSummary(attendanceRes.data.summary || []);
    };

    const loadLogo = async () => {
      const response = await fetch('/assets/images/logo.png');
      const blob = await response.blob();
      const base64 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      });
      setLogoBase64(base64);
    };

    loadData();
    loadLogo();
  }, []);

  const renderHeader = (doc, title) => {
    if (logoBase64) {
      doc.addImage(logoBase64, 'PNG', 14, 10, 45, 14);
    }
    doc.setFontSize(15);
    doc.text('BharatFinvest - Operations Report', 14, 30);
    doc.setFontSize(11);
    doc.text(title, 14, 38);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 45);
  };

  const employeeRows = useMemo(
    () => employees.slice(0, 8).map((e) => [e.employee_code, e.name, e.department, e.designation, e.status]),
    [employees]
  );

  const taskRows = useMemo(
    () => tasks.slice(0, 10).map((t) => [t.title, t.assignee_name, t.priority, t.status, formatDateValue(t.due_date)]),
    [tasks]
  );

  const attendanceRows = useMemo(
    () =>
      attendanceSummary.slice(0, 10).map((a) => [
        a.employee_name,
        a.department,
        a.present_count,
        a.absent_count,
        a.half_day_count,
        `${a.attendance_percent}%`
      ]),
    [attendanceSummary]
  );

  const exportEmployeesPdf = () => {
    const doc = new jsPDF();
    renderHeader(doc, 'Employee Directory');
    autoTable(doc, {
      startY: 52,
      head: [['Code', 'Name', 'Department', 'Designation', 'Status']],
      body: employeeRows
    });
    doc.save('employee-report.pdf');
  };

  const exportTasksPdf = () => {
    const doc = new jsPDF();
    renderHeader(doc, 'Task Tracker Report');
    autoTable(doc, {
      startY: 52,
      head: [['Title', 'Assignee', 'Priority', 'Status', 'Due Date']],
      body: taskRows
    });
    doc.save('task-report.pdf');
  };

  const exportAttendancePdf = () => {
    const doc = new jsPDF();
    renderHeader(doc, 'Attendance Summary Report');
    autoTable(doc, {
      startY: 52,
      head: [['Employee', 'Department', 'Present', 'Absent', 'Half Day', 'Attendance %']],
      body: attendanceRows
    });
    doc.save('attendance-report.pdf');
  };

  return (
    <>
      <Navbar title="Reports" />
      <div className="p-4">
        <div className="row g-3">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white d-flex justify-content-between align-items-center">
                <h6 className="mb-0">Employee Report</h6>
                <button type="button" className="btn btn-sm btn-primary" onClick={exportEmployeesPdf}>Export PDF</button>
              </div>
              <div className="table-responsive">
                <table className="table table-sm table-hover mb-0">
                  <thead><tr><th>Code</th><th>Name</th><th>Department</th><th>Designation</th><th>Status</th></tr></thead>
                  <tbody>
                    {employeeRows.map((row, index) => (
                      <tr key={`emp-${index}`}>
                        {row.map((cell, cellIndex) => (
                          <td key={`emp-${index}-${cellIndex}`}>{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white d-flex justify-content-between align-items-center">
                <h6 className="mb-0">Task Report</h6>
                <button type="button" className="btn btn-sm btn-primary" onClick={exportTasksPdf}>Export PDF</button>
              </div>
              <div className="table-responsive">
                <table className="table table-sm table-hover mb-0">
                  <thead><tr><th>Title</th><th>Assignee</th><th>Priority</th><th>Status</th><th>Due Date</th></tr></thead>
                  <tbody>
                    {taskRows.map((row, index) => (
                      <tr key={`task-${index}`}>
                        {row.map((cell, cellIndex) => (
                          <td key={`task-${index}-${cellIndex}`}>{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white d-flex justify-content-between align-items-center">
                <h6 className="mb-0">Attendance Summary</h6>
                <button type="button" className="btn btn-sm btn-primary" onClick={exportAttendancePdf}>Export PDF</button>
              </div>
              <div className="table-responsive">
                <table className="table table-sm table-hover mb-0">
                  <thead><tr><th>Employee</th><th>Department</th><th>Present</th><th>Absent</th><th>Half Day</th><th>Attendance %</th></tr></thead>
                  <tbody>
                    {attendanceRows.map((row, index) => (
                      <tr key={`att-${index}`}>
                        {row.map((cell, cellIndex) => (
                          <td key={`att-${index}-${cellIndex}`}>{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Reports;
