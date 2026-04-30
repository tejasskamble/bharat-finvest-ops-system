const StatCard = ({ title, value, icon, colorClass, subtitle }) => {
  return (
    <div className="card border-0 shadow-sm h-100" style={{ backgroundColor: '#ffffff', border: '1px solid #dee2e6' }}>
      <div className="card-body d-flex align-items-center">
        <div
          className={`rounded-circle d-flex align-items-center justify-content-center ${colorClass}`}
          style={{ width: '48px', height: '48px' }}
        >
          <i className={`bi ${icon} text-white`}></i>
        </div>
        <div className="ms-3">
          <div className="text-muted" style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {title}
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, lineHeight: 1.1 }}>{value}</div>
          <div className="text-muted" style={{ fontSize: '12px' }}>
            {subtitle}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatCard;
