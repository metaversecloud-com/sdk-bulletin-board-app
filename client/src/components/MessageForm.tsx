import { useContext } from "react";
import { useForm } from "react-hook-form";
import { MessageFormValues } from "@/types";

// context
import { ErrorType } from "@/context/types";
import { GlobalDispatchContext } from "@/context/GlobalContext";

// utils
import { setErrorMessage } from "@/utils";
import { themes } from "@/context/constants";

export const MessageForm = ({
  handleSubmitForm,
  isLoading,
  themeId,
}: {
  handleSubmitForm: ({ imageData, message }: { imageData?: string; message?: string }) => void;
  isLoading: boolean;
  themeId: keyof typeof themes;
}) => {
  const dispatch = useContext(GlobalDispatchContext);
  const { register, handleSubmit, reset } = useForm<MessageFormValues>();

  const onSubmit = handleSubmit(async (data) => {
    const file = data.images ? data.images[0] : null;
    if (file?.size && file?.size > 1048576) {
      setErrorMessage(dispatch, "File is too big!" as ErrorType);
    } else if (file) {
      let dataURL;
      const reader = new FileReader();
      reader.onload = (event: ProgressEvent<FileReader>) => {
        const img: HTMLImageElement = new Image();

        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx: CanvasRenderingContext2D | null = canvas.getContext("2d");
          if (themeId === "CHALK") {
            canvas.width = 141;
            canvas.height = 123;
          } else {
            canvas.width = 300;
            canvas.height = 150;
          }
          if (ctx) ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          dataURL = canvas.toDataURL("image/png");
          handleSubmitForm({ imageData: dataURL });
        };

        img.src = event.target?.result?.toString() || "";
      };
      reader.readAsDataURL(file);
    } else {
      handleSubmitForm(data);
    }
    reset();
  });

  return (
    <>
      <form onSubmit={onSubmit}>
        {themes[themeId].type === "image" ? (
          <>
            <label>Upload your image:</label>
            <p className="p3">(.png, max file size: 1mb)</p>
            <input accept="image/png" className="input" type="file" {...register("images", { required: true })} />
          </>
        ) : (
          <>
            <label>Add your message:</label>
            <p className="p3">(limit 120 characters)</p>
            <textarea
              className="input"
              rows={3}
              maxLength={120}
              {...register("message", { required: true, maxLength: 120 })}
            />
          </>
        )}
        <button className="btn mt-4" type="submit" disabled={isLoading}>
          Submit
        </button>
      </form>
    </>
  );
};

export default MessageForm;
