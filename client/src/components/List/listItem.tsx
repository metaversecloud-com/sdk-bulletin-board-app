import styles from "./styles.module.css";
import CheckIcon from "@mui/icons-material/Check";
import ClearIcon from "@mui/icons-material/Clear";

function ListItem({ message, username, id, editable, onApprove, onRemove, ind }) {
  return (
    <div className={styles.listItem} key={ind}>
      <div className={styles.rightInfo}>{ind+1}</div>

      <div className={styles.info}>
        <div className={styles.message}>{message}</div>
        <div className={styles.posted}>from {username}</div>
      </div>
      {editable && (
        <div className={styles.actions}>
          {onApprove && (
            <button className="btn-icon" onClick={() => onApprove.mutate(id)} disabled={onApprove.isLoading}>
              <CheckIcon />
            </button>
          )}
          {onRemove && (
            <button className="btn-icon" onClick={() => onRemove.mutate(id)} disabled={onRemove.isLoading}>
              <ClearIcon />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default ListItem;
