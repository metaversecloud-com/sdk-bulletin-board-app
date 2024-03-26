export const ListItem = ({
  id,
  hasDivider = true,
  imageUrl,
  isUpdating,
  message,
  onApprove,
  onDelete,
  onDeny,
  username,
}: {
  id: string;
  hasDivider?: boolean;
  imageUrl?: string;
  isUpdating: boolean;
  message?: string;
  onApprove?: any;
  onDelete?: any;
  onDeny?: any;
  username: string;
}) => {
  return (
    <div className="mt-4" key={id}>
      <div className="container mx-auto pb-4">
        <div className="grid gap-4">
          {imageUrl ?
            <img src={imageUrl} />
            :
            <p className="p2">{message}</p>
          }
          <div className="p3">from {username}</div>
        </div>
        <div className="card-actions pt-4">
          {onApprove && (
            <div className="tooltip">
              <span className="tooltip-content">Approve</span>
              <button
                className="btn btn-icon btn-success"
                onClick={() => onApprove(id)}
                disabled={isUpdating}
              >
                &#x2713;
            </button>
            </div>
          )}
          {onDeny && (
            <div className="tooltip">
              <span className="tooltip-content">Deny</span>
              <button
                className="btn btn-icon btn-danger ml-2"
                onClick={() => onDeny(id)}
                disabled={isUpdating}
              >
                X
            </button>
            </div>
          )}
          {onDelete && (
            <div className="tooltip">
              <span className="tooltip-content">Permanently Delete</span>
              <button
                className="btn btn-icon btn-danger ml-2"
                onClick={() => onDelete(id)}
                disabled={isUpdating}
              >
                XX
            </button>
            </div>
          )}
        </div>
      </div>
      {hasDivider && <hr />}
    </div>
  );
}

export default ListItem;