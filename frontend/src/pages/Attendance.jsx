import { useEffect, useMemo, useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

const initialForm = {
  employee_id: '',
  date: new Date().toISOString().split('T')[0],
  check_in: '09:30',
  check_out: '18:00',
  status: 'present'
};

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

const Attendance = () => {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [filters, setFilters] = useState({ employee_id: '', from: '', to: '' });
  const [formData, setFormData] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const canMark = user?.role === 'admin' || user?.role === 'manager';

  const loadEmployees = async () => {
    const { data } = await axiosInstance.get('/employees?page=1&limit=200');
    setEmployees(data.data);
  };

  const loadAttendance = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.employee_id) {
        params.set('employee_id', filters.employee_id);
      }
      if (filters.from) {
        params.set('from', filters.from);
      }
      if (filters.to) {
        params.set('to', filters.to);
      }
      const query = params.toString();
      const { data } = await axiosInstance.get(`/attendance${query ? `?${query}` : ''}`);
      setAttendance(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  useEffect(() => {
    loadAttendance();
  }, [filters]);

  const summary = useMemo(() => {
    return attendance.reduce(
      (acc, row) => {
        acc.total += 1;
        if (row.status === 'present') {
          acc.present += 1;
        }
        if (row.status === 'absent') {
          acc.absent += 1;
        }
        if (row.status === 'half_day') {
          acc.half_day += 1;
        }
        if (row.status === 'leave') {
          acc.leave += 1;
        }
        return acc;
      },
      { total: 0, present: 0, absent: 0, half_day: 0, leave: 0 }
    );
  }, [attendance]);

  const openModal = () => {
    setFormData(initialForm);
    const modal = new window.bootstrap.Modal(document.getElementById('attendanceModal'));
    modal.show();
  };

  const closeModal = () => {
    const modalElement = document.getElementById('attendanceModal');
    const modal = window.bootstrap.Modal.getInstance(modalElement);
    if (modal) {
      modal.hide();
    }
  };

  const handleMarkAttendance = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    const form = event.currentTarget;
    if (!form.checkValidity()) {
      form.classList.add('was-validated');
      return;
    }

    setSaving(true);
    try {
      await axiosInstance.post('/attendance', {
        ...formData,
        employee_id: Number(formData.employee_id),
        check_in: formData.status === 'absent' ? null : `${formData.check_in}:00`,
        check_out: formData.status === 'absent' ? null : `${formData.check_out}:00`
      });
      closeModal();
      await loadAttendance();
    } finally {
      setSaving(false);
    }
  };

  const badgeClass = (status) => {
    if (status === 'present') return 'text-bg-success';
    if (status === 'absent') return 'text-bg-danger';
    if (status === 'half_day') return 'text-bg-warning';
    return 'text-bg-secondary';
  };

  return (
    <>
      <Navbar title="Attendance" />
      <div className="p-4">
        <div className="card border-0 shadow-sm mb-3">
          <div className="card-header bg-white d-flex flex-wrap gap-2 justify-content-between align-items-center">
            <div className="d-flex flex-wrap gap-2">
              <select
                className="form-select"
                style={{ width: '200px' }}
                value={filters.employee_id}
                onChange={(e) => setFilters((prev) => ({ ...prev, employee_id: e.target.value }))}
              >
                <option value="">All Employees</option>
                {employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>{employee.name}</option>
                ))}
              </select>
              <input type="date" className="form-control" value={filters.from} onChange={(e) => setFilters((prev) => ({ ...prev, from: e.target.value }))} />
              <input type="date" className="form-control" value={filters.to} onChange={(e) => setFilters((prev) => ({ ...prev, to: e.target.value }))} />
            </div>
            {canMark ? (
              <button type="button" className="btn btn-primary" onClick={openModal}>
                <i className="bi bi-calendar-plus me-1"></i> Mark Attendance
              </button>
            ) : null}
          </div>

          <div className="card-body py-2">
            <div className="row text-center g-2">
              <div className="col-6 col-md-2"><div className="border rounded py-2">Total<br /><strong>{summary.total}</strong></div></div>
              <div className="col-6 col-md-2"><div className="border rounded py-2">Present<br /><strong>{summary.present}</strong></div></div>
              <div className="col-6 col-md-2"><div className="border rounded py-2">Absent<br /><strong>{summary.absent}</strong></div></div>
              <div className="col-6 col-md-2"><div className="border rounded py-2">Half Day<br /><strong>{summary.half_day}</strong></div></div>
              <div className="col-6 col-md-2"><div className="border rounded py-2">Leave<br /><strong>{summary.leave}</strong></div></div>
            </div>
          </div>

          <div className="table-responsive">
            <table className="table table-hover table-sm mb-0">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="6" className="text-center py-4"><div className="spinner-border spinner-border-sm"></div></td></tr>
                ) : attendance.length === 0 ? (
                  <tr><td colSpan="6" className="text-center py-4 text-muted">No attendance records found</td></tr>
                ) : (
                  attendance.map((row) => (
                    <tr key={row.id}>
                      <td>{formatDateValue(row.date)}</td>
                      <td>{row.employee_name}</td>
                      <td>{row.department}</td>
                      <td>{row.check_in || '-'}</td>
                      <td>{row.check_out || '-'}</td>
                      <td><span className={`badge ${badgeClass(row.status)}`}>{row.status}</span></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="modal fade" id="attendanceModal" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <form className="needs-validation" onSubmit={handleMarkAttendance} noValidate>
              <div className="modal-header">
                <h5 className="modal-title">Mark Attendance</h5>
                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div className="modal-body">
                <div className="mb-2">
                  <label className="form-label">Employee</label>
                  <select className="form-select" required value={formData.employee_id} onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}>
                    <option value="">Select employee</option>
                    {employees.map((employee) => (
                      <option key={employee.id} value={employee.id}>{employee.name}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-2">
                  <label className="form-label">Date</label>
                  <input type="date" className="form-control" required value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
                </div>
                <div className="row g-2">
                  <div className="col-md-6">
                    <label className="form-label">Check In</label>
                    <input type="time" className="form-control" value={formData.check_in} onChange={(e) => setFormData({ ...formData, check_in: e.target.value })} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Check Out</label>
                    <input type="time" className="form-control" value={formData.check_out} onChange={(e) => setFormData({ ...formData, check_out: e.target.value })} />
                  </div>
                </div>
                <div className="mt-2">
                  <label className="form-label">Status</label>
                  <select className="form-select" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                    <option value="present">Present</option>
                    <option value="absent">Absent</option>
                    <option value="half_day">Half Day</option>
                    <option value="leave">Leave</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <span className="spinner-border spinner-border-sm me-1"></span> : null}
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Attendance;
