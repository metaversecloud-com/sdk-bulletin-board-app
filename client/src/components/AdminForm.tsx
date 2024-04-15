import { useForm } from "react-hook-form";
import { ThemeIds } from '@context/types';
import { AdminFormValues } from "@/types";

export function AdminForm({
  handleSubmitForm,
  isLoading,
  theme,
}: {
  handleSubmitForm: (data: AdminFormValues) => void;
  isLoading: boolean;
  theme: {
    id: string;
    description: string;
    subtitle: string;
    title: string;
  };
}) {
  const {
    handleSubmit,
    register,
  } = useForm<AdminFormValues>()

  const onSubmit = handleSubmit((data) => handleSubmitForm(data))

  return (
    <>
      <form onSubmit={onSubmit}>
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
        <button className="btn mt-4" type="submit" disabled={isLoading}>
          Submit
        </button>
      </form>
    </>
  );
}

export default AdminForm;
