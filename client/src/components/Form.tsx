import { useForm } from "react-hook-form";

export function Form({
  handleSubmitForm,
  isLoading,
}: {
  handleSubmitForm: any;
  isLoading: boolean;
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const onSubmit = (data: any) => {
    console.log("🚀 ~ file: Form.tsx:18 ~ data:", data)
    handleSubmitForm(data.message);
    reset();
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <label>Message (limit 120 characters):</label>
        <textarea
          className="input"
          rows={3}
          maxLength={120}
          {...register("message", { required: true, maxLength: 120 })}
        />
        {errors.message && (
          <span className="text-error">Please enter a message</span>
        )}
        <button className="btn mt-4" type="submit" disabled={isLoading}>
          Submit
        </button>
      </form>
    </>
  );
}

export default Form;
