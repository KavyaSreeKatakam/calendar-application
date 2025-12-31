export default function Modal({ title, onClose, children }) {
    return (
      <div className="overlay">
        <div className="modal">
          <header>
            <h3>{title}</h3>
            <button onClick={onClose}>✖</button>
          </header>
          {children}
        </div>
      </div>
    );
  }
  