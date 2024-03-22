export const ListItem = ({
  id,
  message,
  isUpdating,
  onApprove,
  onRemove,
  username,
}: {
  id: string;
  isUpdating: boolean;
  message: string;
  onApprove: any;
  onRemove: any;
  username: string;
}) => {
  return (
    <div className="card horizontal" key={id}>
      <div className="card-details">
        <p className="card-description p2">{message}</p>
        <p className="card-description p3">from {username}</p>
        <div className="card-actions">
          {onApprove && (
            <button
              className="btn-icon"
              style={{ marginBottom: "5px", color: "green" }}
              onClick={() => onApprove(id)}
              disabled={isUpdating}
            >
              &#x2713;
            </button>
          )}
          {onRemove && (
            <button
              className="btn-icon"
              style={{ color: "red" }}
              onClick={() => onRemove(id)}
              disabled={isUpdating}
            >
              X
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ListItem;
