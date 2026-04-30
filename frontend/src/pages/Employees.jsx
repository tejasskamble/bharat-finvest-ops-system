import { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import Navbar from '../components/Navbar';
import Avatar from '../components/Avatar';
import { useAuth } from '../context/AuthContext';

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
  const { user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [togglingId, setTogglingId] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState(defaultForm);
  const [banner, setBanner] = useState(null);
  const [modalError, setModalError] = useState('');

  const canManageEmployees = user?.role === 'admin' || user?.role === 'manager';
  const canDeactivateEmployees = user?.role === 'admin';

  const loadEmployees = async ({ page = 1, searchTerm = debouncedSearch } = {}) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', '10');
      if (searchTerm.trim()) {
        params.set('search', searchTerm.trim());
      }

      const { data } = await axiosInstance.get(`/employees?${params.toString()}`);
      setEmployees(data.data || []);
      setPagination(data.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 });
      setBanner(null);
    } catch (requestError) {
      setBanner({
        type: 'danger',
        text: requestError.response?.data?.message || 'Failed to load employees.'
      });
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    loadEmployees({ page: 1, searchTerm: debouncedSearch });
  }, [debouncedSearch]);

  const openEmployeeModal = () => {
    const modal = new window.bootstrap.Modal(document.getElementById('employeeModal'));
    modal.show();
  };

  const openAddModal = () => {
    if (!canManageEmployees) {
      setBanner({ type: 'warning', text: 'Only admin or manager can add employees.' });
      return;
    }

    setIsEdit(false);
    setCurrentId(null);
    setModalError('');
    setFormData(defaultForm);
    openEmployeeModal();
  };

  const openEditModal = (employee) => {
    if (!canManageEmployees) {
      setBanner({ type: 'warning', text: 'Only admin or manager can edit employees.' });
      return;
    }

    setIsEdit(true);
    setCurrentId(employee.id);
    setModalError('');
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
    openEmployeeModal();
  };

  const closeModal = () => {
    const modalElement = document.getElementById('employeeModal');
    const modal = window.bootstrap.Modal.getInstance(modalElement);
    if (modal) {
      modal.hide();
    }

    const form = modalElement?.querySelector('form');
    form?.classList.remove('was-validated');
    setModalError('');
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
    setModalError('');
    try {
      const payload = {
        ...formData,
        user_id: formData.user_id ? Number(formData.user_id) : null
      };

      if (isEdit) {
        await axiosInstance.put(`/employees/${currentId}`, payload);
        setBanner({ type: 'success', text: 'Employee updated successfully.' });
      } else {
        await axiosInstance.post('/employees', payload);
        setBanner({ type: 'success', text: 'Employee created successfully.' });
      }

      closeModal();
      await loadEmployees({ page: pagination.page, searchTerm: debouncedSearch });
    } catch (requestError) {
      setModalError(requestError.response?.data?.message || 'Failed to save employee.');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusToggle = async (employee) => {
    if (!canDeactivateEmployees) {
      setBanner({ type: 'warning', text: 'Only admin can change employee status.' });
      return;
    }

    const action = employee.status === 'active' ? 'deactivate' : 'activate';
    const confirmed = window.confirm(`Are you sure you want to ${action} ${employee.name}?`);
    if (!confirmed) {
      return;
    }

    setTogglingId(employee.id);
    try {
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

      setBanner({
        type: 'success',
        text: `Employee ${employee.status === 'active' ? 'deactivated' : 'activated'} successfully.`
      });
      await loadEmployees({ page: pagination.page, searchTerm: debouncedSearch });
    } catch (requestError) {
      setBanner({
        type: 'danger',
        text: requestError.response?.data?.message || 'Failed to update employee status.'
      });
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <>
      <Navbar title="Employees" />
      <div className="p-4">
        {banner ? (
          <div className={`alert alert-${banner.type} alert-dismissible fade show`} role="alert">
            {banner.text}
            <button type="button" className="btn-close" onClick={() => setBanner(null)} aria-label="Close"></button>
          </div>
        ) : null}

        <div className="card border-0 shadow-sm">
          <div className="card-header bg-white d-flex justify-content-between align-items-center flex-wrap gap-2">
            <input
              type="text"
              className="form-control"
              placeholder="Search by code, name, email, department or designation"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: 'min(100%, 420px)' }}
            />
            <button type="button" className="btn btn-primary" onClick={openAddModal} disabled={!canManageEmployees}>
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
                ) : employees.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-muted">
                      No employees found
                    </td>
                  </tr>
                ) : (
                  employees.map((employee) => (
                    <tr key={employee.id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <Avatar name={employee.name} size={32} className="me-2" />
                          <div>
                            <div className="fw-semibold">{employee.name}</div>
                            <div className="text-muted" style={{ fontSize: '12px' }}>
                              {employee.email}
                            </div>
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
                        {canManageEmployees ? (
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-primary me-2"
                            onClick={() => openEditModal(employee)}
                          >
                            Edit
                          </button>
                        ) : null}
                        {canDeactivateEmployees ? (
                          <button
                            type="button"
                            className={`btn btn-sm ${employee.status === 'active' ? 'btn-outline-danger' : 'btn-outline-success'}`}
                            onClick={() => handleStatusToggle(employee)}
                            disabled={togglingId === employee.id}
                          >
                            {togglingId === employee.id ? (
                              <span className="spinner-border spinner-border-sm"></span>
                            ) : employee.status === 'active' ? (
                              'Deactivate'
                            ) : (
                              'Activate'
                            )}
                          </button>
                        ) : (
                          <span className="text-muted" style={{ fontSize: '12px' }}>
                            View only
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="card-footer bg-white d-flex justify-content-between align-items-center">
            <small className="text-muted">
              Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
            </small>
            <div>
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary me-2"
                disabled={pagination.page <= 1 || loading}
                onClick={() => loadEmployees({ page: pagination.page - 1, searchTerm: debouncedSearch })}
              >
                Previous
              </button>
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                disabled={pagination.page >= pagination.totalPages || loading}
                onClick={() => loadEmployees({ page: pagination.page + 1, searchTerm: debouncedSearch })}
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
                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" disabled={saving}></button>
              </div>
              <div className="modal-body">
                {modalError ? <div className="alert alert-danger py-2">{modalError}</div> : null}
                <div className="row g-2">
                  <div className="col-md-6">
                    <label className="form-label">Employee Code</label>
                    <input
                      className="form-control"
                      required
                      value={formData.employee_code}
                      onChange={(e) => setFormData({ ...formData, employee_code: e.target.value })}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Name</label>
                    <input
                      className="form-control"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Phone</label>
                    <input
                      className="form-control"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Department</label>
                    <input
                      className="form-control"
                      required
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Designation</label>
                    <input
                      className="form-control"
                      required
                      value={formData.designation}
                      onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Date of Joining</label>
                    <input
                      type="date"
                      className="form-control"
                      required
                      value={formData.date_of_joining}
                      onChange={(e) => setFormData({ ...formData, date_of_joining: e.target.value })}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Status</label>
                    <select
                      className="form-select"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline-secondary" onClick={closeModal} disabled={saving}>
                  Cancel
                </button>
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
