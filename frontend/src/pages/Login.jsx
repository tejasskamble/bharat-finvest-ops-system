import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import BrandLogo from '../components/BrandLogo';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, isLoading } = useAuth();
  const [email, setEmail] = useState('admin@bharatfinvest.com');
  const [password, setPassword] = useState('Admin@123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isLoading && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    const form = event.currentTarget;
    if (!form.checkValidity()) {
      form.classList.add('was-validated');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data } = await axiosInstance.post('/auth/login', { email, password });
      login(data.token, data.user);
      form.classList.remove('was-validated');
      navigate('/dashboard');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid min-vh-100">
      <div className="row min-vh-100">
        <div className="col-lg-6 d-flex align-items-center justify-content-center bg-light p-4">
          <div className="card shadow border-0" style={{ width: '100%', maxWidth: '460px' }}>
            <div className="card-body p-4 p-md-5">
              <div className="text-center mb-4">
                <BrandLogo
                  className="d-inline-block"
                  align="center"
                  titleColor="#1a3c5e"
                  subtitleColor="#1a3c5e"
                  titleSize="30px"
                  subtitleSize="13px"
                />
                <p className="text-muted mt-2 mb-0">Internal Operations Management Portal</p>
              </div>

              {error && <div className="alert alert-danger py-2">{error}</div>}

              <form className="needs-validation" onSubmit={handleSubmit} noValidate>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email</label>
                  <input
                    id="email"
                    type="email"
                    className="form-control"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="password" className="form-label">Password</label>
                  <div className="input-group">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      className="form-control"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => setShowPassword((prev) => !prev)}
                    >
                      <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                    </button>
                  </div>
                </div>
                <button type="submit" className="btn w-100 text-white" style={{ backgroundColor: '#1a3c5e' }} disabled={loading}>
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
                      Signing in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </form>

              <div className="card mt-4 border-0" style={{ backgroundColor: '#f8f9fa' }}>
                <div className="card-body py-3">
                  <div className="fw-semibold mb-2">Demo Credentials</div>
                  <div style={{ fontSize: '13px' }}>Admin: admin@bharatfinvest.com / Admin@123</div>
                  <div style={{ fontSize: '13px' }}>Manager: manager@bharatfinvest.com / Manager@123</div>
                  <div style={{ fontSize: '13px' }}>Employee: employee@bharatfinvest.com / Emp@123</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          className="col-lg-6 d-none d-lg-flex align-items-end p-5 text-white"
          style={{
            backgroundImage: "linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.45)), url('/assets/images/login-bg.jpg')",
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div>
            <h2 className="fw-bold">Securely Manage Finance Operations</h2>
            <p className="mb-0">Track people, tasks, and attendance across departments with one unified portal.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
