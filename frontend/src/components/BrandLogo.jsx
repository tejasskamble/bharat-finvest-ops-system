const BrandLogo = ({
  titleColor = '#1a3c5e',
  subtitleColor = '#5f6b7a',
  align = 'left',
  titleSize = '24px',
  subtitleSize = '12px',
  className = ''
}) => {
  return (
    <div className={className} style={{ textAlign: align, lineHeight: 1.1 }}>
      <div style={{ color: titleColor, fontWeight: 700, fontSize: titleSize, letterSpacing: '0.2px' }}>
        BharatFinvest
      </div>
      <div style={{ color: subtitleColor, fontSize: subtitleSize, letterSpacing: '0.35px' }}>Operations Portal</div>
    </div>
  );
};

export default BrandLogo;

