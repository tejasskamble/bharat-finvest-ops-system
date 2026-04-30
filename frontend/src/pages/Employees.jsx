import { useEffect, useMemo, useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import Navbar from '../components/Navbar';

const defaultForm = {
  user_id: '',
  employee_code: '',
  name: '',
  email: '',
  phone: '',
  department: '',
  designation: '',
  date_of_joining: '',
  status: 'active'
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

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState(defaultForm);

  const loadEmployees = async (page = 1) => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get(`/employees?page=${page}&limit=10`);
      setEmployees(data.data);
      setPagination(data.pagination);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees(1);
  }, []);

  const filteredEmployees = useMemo(() => {
    if (!search.trim()) {
      return employees;
    }

    const term = search.toLowerCase();
    return employees.filter((employee) =>
      [employee.employee_code, employee.name, employee.email, employee.department, employee.designation]
        .join(' ')
        .toLowerCase()
        .includes(term)
    );
  }, [employees, search]);

  const openAddModal = () => {
    setIsEdit(false);
    setCurrentId(null);
    setFormData(defaultForm);
    const modal = new window.bootstrap.Modal(document.getElementById('employeeModal'));
    modal.show();
  };

  const openEditModal = (employee) => {
    setIsEdit(true);
    setCurrentId(employee.id);
    setFormData({
      user_id: employee.user_id || '',
      employee_code: employee.employee_code,
      name: employee.name,
      email: employee.email,
      phone: employee.phone,
      department: employee.department,
      designation: employee.designation,
      date_of_joining: formatDateValue(employee.date_of_joining),
      status: employee.status
    });
    const modal = new window.bootstrap.Modal(document.getElementById('employeeModal'));
    modal.show();
  };

  const closeModal = () => {
    const modalElement = document.getElementById('employeeModal');
    const modal = window.bootstrap.Modal.getInstance(modalElement);
    if (modal) {
      modal.hide();
    }
  };

  const handleSave = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    const form = event.currentTarget;
    if (!form.checkValidity()) {
      form.classList.add('was-validated');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...formData,
        user_id: formData.user_id ? Number(formData.user_id) : null
      };

      if (isEdit) {
        await axiosInstance.put(`/employees/${currentId}`, payload);
      } else {
        await axiosInstance.post('/employees', payload);
      }

      closeModal();
      await loadEmployees(pagination.page);
    } finally {
      setSaving(false);
    }
  };

  const handleStatusToggle = async (employee) => {
    if (employee.status === 'active') {
      await axiosInstance.delete(`/employees/${employee.id}`);
    } else {
      await axiosInstance.put(`/employees/${employee.id}`, {
        user_id: employee.user_id,
        employee_code: employee.employee_code,
        name: employee.name,
        email: employee.email,
        phone: employee.phone,
        department: employee.department,
        designation: employee.designation,
        date_of_joining: formatDateValue(employee.date_of_joining),
        status: 'active'
      });
    }

    await loadEmployees(pagination.page);
  };

  return (
    <>
      <Navbar title="Employees" />
      <div className="p-4">
        <div className="card border-0 shadow-sm">
          <div className="card-header bg-white d-flex justify-content-between align-items-center">
            <div className="d-flex gap-2 align-items-center">
              <input
                type="text"
                className="form-control"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: '280px' }}
              />
            </div>
            <button type="button" className="btn btn-primary" onClick={openAddModal}>
              <i className="bi bi-plus-circle me-1"></i> Add Employee
            </button>
          </div>

          <div className="table-responsive">
            <table className="table table-hover table-sm mb-0">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Code</th>
                  <th>Department</th>
                  <th>Designation</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4">
                      <div className="spinner-border spinner-border-sm"></div>
                    </td>
                  </tr>
                ) : filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-muted">No employees found</td>
                  </tr>
                ) : (
                  filteredEmployees.map((employee) => (
                    <tr key={employee.id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <img
                            src="/assets/images/avatar-default.png"
                            alt="avatar"
                            className="rounded-circle me-2"
                            style={{ width: '32px', height: '32px', objectFit: 'cover' }}
                          />
                          <div>
                            <div className="fw-semibold">{employee.name}</div>
                            <div className="text-muted" style={{ fontSize: '12px' }}>{employee.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>{employee.employee_code}</td>
                      <td>{employee.department}</td>
                      <td>{employee.designation}</td>
                      <td>
                        <span className={`badge ${employee.status === 'active' ? 'text-bg-success' : 'text-bg-secondary'}`}>
                          {employee.status}
                        </span>
                      </td>
                      <td className="text-end">
                        <button type="button" className="btn btn-sm btn-outline-primary me-2" onClick={() => openEditModal(employee)}>
                          Edit
                        </button>
                        <button
                          type="button"
                          className={`btn btn-sm ${employee.status === 'active' ? 'btn-outline-danger' : 'btn-outline-success'}`}
                          onClick={() => handleStatusToggle(employee)}
                        >
                          {employee.status === 'active' ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="card-footer bg-white d-flex justify-content-between align-items-center">
            <small className="text-muted">Page {pagination.page} of {pagination.totalPages}</small>
            <div>
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary me-2"
                disabled={pagination.page <= 1}
                onClick={() => loadEmployees(pagination.page - 1)}
              >
                Previous
              </button>
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => loadEmployees(pagination.page + 1)}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="modal fade" id="employeeModal" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <form className="needs-validation" onSubmit={handleSave} noValidate>
              <div className="modal-header">
                <h5 className="modal-title">{isEdit ? 'Edit Employee' : 'Add Employee'}</h5>
                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div className="modal-body">
                <div className="row g-2">
                  <div className="col-md-6">
                    <label className="form-label">Employee Code</label>
                    <input className="form-control" required value={formData.employee_code} onChange={(e) => setFormData({ ...formData, employee_code: e.target.value })} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Name</label>
                    <input className="form-control" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Email</label>
                    <input type="email" className="form-control" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Phone</label>
                    <input className="form-control" required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Department</label>
                    <input className="form-control" required value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Designation</label>
                    <input className="form-control" required value={formData.designation} onChange={(e) => setFormData({ ...formData, designation: e.target.value })} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Date of Joining</label>
                    <input type="date" className="form-control" required value={formData.date_of_joining} onChange={(e) => setFormData({ ...formData, date_of_joining: e.target.value })} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Status</label>
                    <select className="form-select" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <span className="spinner-border spinner-border-sm me-1"></span> : null}
                  {isEdit ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Employees;
