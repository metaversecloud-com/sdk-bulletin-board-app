export const ListItem = ({
  id,
  displayName,
  hasDivider = true,
  imageUrl,
  areButtonsDisabled,
  message,
  onApprove,
  onDelete,
  username,
}: {
  id: string;
  displayName?: string;
  hasDivider?: boolean;
  imageUrl?: string;
  areButtonsDisabled: boolean;
  message?: string;
  onApprove?: any;
  onDelete?: any;
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
          {displayName && <div className="p3">from {displayName} {username && username !== displayName && `(${username})`}</div>}
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
