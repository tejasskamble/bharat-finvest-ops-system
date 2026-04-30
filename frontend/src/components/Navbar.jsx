import { useEffect, useState } from 'react';

const Navbar = ({ title }) => {
  const [timeLabel, setTimeLabel] = useState(new Date().toLocaleString());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLabel(new Date().toLocaleString());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <header
      className="d-flex align-items-center justify-content-between px-4"
      style={{
        height: '56px',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #dee2e6'
      }}
    >
      <div>
        <h1 className="mb-0" style={{ fontSize: '20px', fontWeight: 600 }}>
          {title}
        </h1>
        <div className="text-muted" style={{ fontSize: '12px' }}>
          Home / {title}
        </div>
      </div>
      <div className="text-muted" style={{ fontSize: '13px' }}>
        <i className="bi bi-clock me-2"></i>
        {timeLabel}
      </div>
    </header>
  );
};

export default Navbar;
