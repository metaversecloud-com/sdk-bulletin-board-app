import {UseMutationResult } from "react-query";
import ListItem from "./listItem";
import styles from "./styles.module.css";

interface ListItemsProp {
  message: string;
  userName: string;
  id: number;
  hasRightInfo: boolean;
}

function ListComponent({
  listItems,
  title,
  editable,
  onApprove,
  onRemove,
}: {
  listItems: ListItemsProp[];
  title: string;
  editable: boolean;
  onApprove?: UseMutationResult;
  onRemove?: UseMutationResult
}) {
  return (
    <div className={styles.container}>
      <div className={styles.titleContainer}>
        <h3>{title}</h3>
      </div>
      {listItems.map((item, i) => (
        <ListItem
          ind={i}
          key={i}
          message={item.message}
          username={item.userName}
          id={item.id}
          editable={editable}
          onRemove={onRemove}
          onApprove={onApprove}
        />
      ))}
    </div>
  );
}

export default ListComponent;
