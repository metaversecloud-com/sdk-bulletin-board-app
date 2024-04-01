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
    } else if (file) {
      const reader = new FileReader();
      reader.onload = function (event: any) {
        const img: any = new Image();
        img.onload = function () {
          const canvas = document.createElement('canvas');
          const ctx: any = canvas.getContext('2d');

          canvas.width = 141;
          canvas.height = 123;
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          // Convert the canvas content to a Blob object
          canvas.toBlob(function (blob: any) {
            const image = URL.createObjectURL(blob);
            handleSubmitForm({ image });
          }, 'image/png');
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    } else {
      handleSubmitForm(data);
    }
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
