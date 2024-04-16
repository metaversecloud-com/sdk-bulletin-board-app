export const Modal = ({ buttonText, children, onConfirm, setShowModal, text, title }: { buttonText: string, children: React.ReactNode, onConfirm: () => void, setShowModal: (value: boolean) => void, text: string, title: string }) => {
  return (
    <div className="modal-container">
      <div className="modal">
        <h4 className="h4">{title}</h4>
        <p className="p2 text-left">
          {text}
        </p>
        {children}
        <div className="actions">
          <button className="btn btn-outline" onClick={() => setShowModal(false)}>
            Close
          </button>
          <button className="btn btn-danger" onClick={onConfirm}>
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
