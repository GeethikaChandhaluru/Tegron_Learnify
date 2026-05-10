export default function Loader({ fullPage = false }) {
  if (fullPage) {
    return (
      <div style={{
        position: 'fixed', inset: 0, display: 'flex', alignItems: 'center',
        justifyContent: 'center', background: 'var(--light-gray)', zIndex: 9999,
      }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto 16px' }} />
          <p style={{ fontFamily: 'Syne,sans-serif', color: 'var(--navy)', fontWeight: 600 }}>
            Loading…
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className="loader-wrap">
      <div className="spinner" />
    </div>
  );
}
