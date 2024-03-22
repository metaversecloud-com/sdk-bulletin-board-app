import ListItem from "./ListItem";

interface ListItemsProp {
  id: string,
  message: string,
  userId: string,
  userName: string,
  approved: boolean,
}

export const List = ({
  listItems,
  title,
  isUpdating,
  onApprove,
  onRemove,
}: {
  listItems: {
    [key: string]: ListItemsProp
  };
  title: string;
  isUpdating: boolean;
  onApprove?: any;
  onRemove?: any;
}) => {
  return (
    <>
      <h4 className="h4">{title}</h4>
      {Object.values(listItems).forEach((item) => {
        return <ListItem
          id={item.id}
          message={item.message}
          isUpdating={isUpdating}
          onRemove={onRemove}
          onApprove={onApprove}
          username={item.userName}
        />
      })}
    </>
  );
}

export default List;
