const getInitials = (name) => {
  const cleanName = (name || '').trim();
  if (!cleanName) {
    return 'U';
  }

  const words = cleanName.split(/\s+/).filter(Boolean);
  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase();
  }

  return words
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('');
};

const Avatar = ({ name, size = 40, className = '' }) => {
  const initials = getInitials(name);
  const fontSize = Math.max(12, Math.round(size * 0.38));

  return (
    <div
      className={`d-inline-flex align-items-center justify-content-center ${className}`.trim()}
      title={name || 'User'}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        minWidth: `${size}px`,
        background: '#1a3c5e',
        color: '#ffffff',
        borderRadius: '50%',
        fontWeight: 600,
        fontSize: `${fontSize}px`,
        lineHeight: 1,
        textTransform: 'uppercase',
        userSelect: 'none'
      }}
    >
      {initials}
    </div>
  );
};

export default Avatar;

