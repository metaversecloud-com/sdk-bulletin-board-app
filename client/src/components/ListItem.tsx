export const ListItem = ({
  id,
  hasDivider = true,
  imageUrl,
  areButtonsDisabled,
  message,
  onApprove,
  onDelete,
  onDeny,
  username,
}: {
  id: string;
  hasDivider?: boolean;
  imageUrl?: string;
  areButtonsDisabled: boolean;
  message?: string;
  onApprove?: any;
  onDelete?: any;
  onDeny?: any;
  username?: string;
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
          {username && <div className="p3">from {username}</div>}
        </div>
        <div className="card-actions pt-4">
          {onApprove && (
            <div className="tooltip">
              <span className="tooltip-content">Approve</span>
              <button
                className="btn btn-icon"
                onClick={() => onApprove(id)}
                disabled={areButtonsDisabled}
              >
                <img src="https://sdk-style.s3.amazonaws.com/icons/check.svg" />
              </button>
            </div>
          )}
          {onDeny && (
            <div className="tooltip">
              <span className="tooltip-content">Deny</span>
              <button
                className="btn btn-icon ml-2"
                onClick={() => onDeny(id)}
                disabled={areButtonsDisabled}
              >
                <img src="https://sdk-style.s3.amazonaws.com/icons/x.svg" />
              </button>
            </div>
          )}
          {onDelete && (
            <div className="tooltip">
              <span className="tooltip-content">Delete</span>
              <button
                className="btn btn-icon ml-2"
                onClick={() => onDelete(id)}
                disabled={areButtonsDisabled}
              >
                <img src="https://sdk-style.s3.amazonaws.com/icons/delete.svg" />
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
