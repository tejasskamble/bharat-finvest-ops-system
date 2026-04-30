import { useEffect, useMemo, useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

const initialTask = {
  title: '',
  description: '',
  assigned_to: '',
  priority: 'medium',
  status: 'pending',
  due_date: ''
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

const Tasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [formData, setFormData] = useState(initialTask);
  const [isEdit, setIsEdit] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  const loadEmployees = async () => {
    const { data } = await axiosInstance.get('/employees?page=1&limit=200');
    setEmployees(data.data.filter((employee) => employee.status === 'active'));
  };

  const loadTasks = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) {
        params.set('status', statusFilter);
      }
      if (priorityFilter) {
        params.set('priority', priorityFilter);
      }
      const query = params.toString();
      const { data } = await axiosInstance.get(`/tasks${query ? `?${query}` : ''}`);
      setTasks(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  useEffect(() => {
    loadTasks();
  }, [statusFilter, priorityFilter]);

  const openAddModal = () => {
    setIsEdit(false);
    setCurrentId(null);
    setFormData(initialTask);
    const modal = new window.bootstrap.Modal(document.getElementById('taskModal'));
    modal.show();
  };

  const openEditModal = (task) => {
    setIsEdit(true);
    setCurrentId(task.id);
    setFormData({
      title: task.title,
      description: task.description || '',
      assigned_to: String(task.assigned_to),
      priority: task.priority,
      status: task.status,
      due_date: formatDateValue(task.due_date)
    });
    const modal = new window.bootstrap.Modal(document.getElementById('taskModal'));
    modal.show();
  };

  const closeModal = () => {
    const modalElement = document.getElementById('taskModal');
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
        assigned_to: Number(formData.assigned_to),
        assigned_by: user.id
      };

      if (isEdit) {
        await axiosInstance.put(`/tasks/${currentId}`, payload);
      } else {
        await axiosInstance.post('/tasks', payload);
      }

      closeModal();
      await loadTasks();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (taskId) => {
    await axiosInstance.delete(`/tasks/${taskId}`);
    await loadTasks();
  };

  const today = useMemo(() => new Date().toISOString().split('T')[0], []);

  return (
    <>
      <Navbar title="Tasks" />
      <div className="p-4">
        <div className="card border-0 shadow-sm">
          <div className="card-header bg-white d-flex flex-wrap gap-2 justify-content-between align-items-center">
            <div className="d-flex flex-wrap gap-2">
              <select className="form-select" style={{ width: '180px' }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
              <select className="form-select" style={{ width: '180px' }} value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
                <option value="">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <button type="button" className="btn btn-primary" onClick={openAddModal}>
              <i className="bi bi-plus-circle me-1"></i> Add Task
            </button>
          </div>

          <div className="table-responsive">
            <table className="table table-hover table-sm mb-0">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Assignee</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Due Date</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4"><div className="spinner-border spinner-border-sm"></div></td>
                  </tr>
                ) : tasks.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-muted">No tasks found</td>
                  </tr>
                ) : (
                  tasks.map((task) => {
                    const taskDate = formatDateValue(task.due_date);
                    const isOverdue = taskDate < today && task.status !== 'completed';
                    return (
                      <tr key={task.id} className={isOverdue ? 'table-danger' : ''}>
                        <td>
                          <div className="fw-semibold">{task.title}</div>
                          <div className="text-muted" style={{ fontSize: '12px' }}>{task.description}</div>
                        </td>
                        <td>{task.assignee_name}</td>
                        <td><span className={`badge text-bg-${task.priority === 'high' ? 'danger' : task.priority === 'medium' ? 'warning' : 'secondary'}`}>{task.priority}</span></td>
                        <td><span className="badge text-bg-info text-dark">{task.status}</span></td>
                        <td>{taskDate}</td>
                        <td className="text-end">
                          <button type="button" className="btn btn-sm btn-outline-primary me-2" onClick={() => openEditModal(task)}>Edit</button>
                          {user.role === 'admin' ? (
                            <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(task.id)}>Delete</button>
                          ) : null}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="modal fade" id="taskModal" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <form className="needs-validation" onSubmit={handleSave} noValidate>
              <div className="modal-header">
                <h5 className="modal-title">{isEdit ? 'Edit Task' : 'Add Task'}</h5>
                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div className="modal-body">
                <div className="mb-2">
                  <label className="form-label">Title</label>
                  <input className="form-control" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
                </div>
                <div className="mb-2">
                  <label className="form-label">Description</label>
                  <textarea className="form-control" rows="3" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}></textarea>
                </div>
                <div className="row g-2">
                  <div className="col-md-6">
                    <label className="form-label">Assignee</label>
                    <select className="form-select" required value={formData.assigned_to} onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}>
                      <option value="">Select employee</option>
                      {employees.map((employee) => (
                        <option key={employee.id} value={employee.id}>{employee.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Due Date</label>
                    <input type="date" className="form-control" required value={formData.due_date} onChange={(e) => setFormData({ ...formData, due_date: e.target.value })} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Priority</label>
                    <select className="form-select" value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })}>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Status</label>
                    <select className="form-select" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
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

export default Tasks;
