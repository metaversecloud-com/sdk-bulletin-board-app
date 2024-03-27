import { useForm } from "react-hook-form";

export function MessageForm({
  handleSubmitForm,
  isLoading,
  themeId
}: {
  handleSubmitForm: any;
  isLoading: boolean;
  themeId: string
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const onSubmit = (data: any) => {
    const file = data.images ? data.images[0] : null
    if (file?.size > 1048576) {
      return alert("File is too big!");
    }
    handleSubmitForm(data);
    reset();
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        {themeId === "CHALK" ?
          <>
            <label>Upload your image:</label>
            <p className="p3">(.png, max file size: ___)</p>
            <input
              accept="image/png"
              className="input"
              type="file"
              {...register("images", { required: true })}
            />
          </>
          :
          (<>
            <label>Add your message:</label>
            <p className="p3">(limit 120 characters)</p>
            <textarea
              className="input"
              rows={3}
              maxLength={120}
              {...register("message", { required: true, maxLength: 120 })}
            />
            {errors.message && (
              <span className="text-error">Please enter a message</span>
            )}
          </>
          )}
        <button className="btn mt-4" type="submit" disabled={isLoading}>
          Submit
        </button>
      </form>
    </>
  );
}

export default MessageForm;
