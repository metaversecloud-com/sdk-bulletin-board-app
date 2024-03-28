import { useForm } from "react-hook-form";
import { ThemeIds } from '../context/types';

export function AdminForm({
  handleSubmitForm,
  isLoading,
  theme,
}: {
  handleSubmitForm: any;
  isLoading: boolean;
  theme: {
    id: string;
    description: string;
    subtitle: string;
    title: string;
  };
}) {
  const {
    formState: { errors },
    handleSubmit,
    register,
  } = useForm();

  const onSubmit = (data: any) => {
    handleSubmitForm(data);
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <label>Theme:</label>
        <select className="input mb-4" {...register("id", { required: true, value: theme.id })}>
          {Object.keys(ThemeIds).map((id) => <option key={id} value={id}>{ThemeIds[id]}</option>)}
        </select>
        <label>Title:</label>
        <input
          className="input mb-4"
          {...register("title", { required: true, value: theme.title })}
        />
        <label>Subtitle:</label>
        <input
          className="input mb-4"
          {...register("subtitle", { required: true, value: theme.subtitle })}
        />
        <label>Description:</label>
        <textarea
          className="input mb-4"
          {...register("description", { value: theme.description })}
        />
        {errors.message && (
          <span className="text-error">{`${errors.message}`}</span>
        )}
        <button className="btn mt-4" type="submit" disabled={isLoading}>
          Submit
        </button>
      </form>
    </>
  );
}

export default AdminForm;
