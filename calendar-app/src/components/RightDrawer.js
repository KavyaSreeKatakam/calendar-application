export default function RightDrawer({ title, onClose, children }) {
  return (
    <div className="right-drawer-overlay" onClick={onClose}>
      <div
        className="right-drawer"
        onClick={e => e.stopPropagation()}
      >
        <div className="right-drawer-header">
          <h3>{title}</h3>
          <button onClick={onClose}>✕</button>
        </div>

        <div className="right-drawer-content">
          {children}
        </div>
      </div>
    </div>
  );
}
