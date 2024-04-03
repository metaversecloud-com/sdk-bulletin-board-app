export const Modal = ({ buttonText, onConfirm, setShowModal, text, title }: { buttonText: string, onConfirm: any, setShowModal: any, text: string, title: string }) => {
  return (
    <div className="modal-container">
      <div className="modal">
        <h4 className="h4">{title}</h4>
        <p className="p2">
          {text}
        </p>
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
