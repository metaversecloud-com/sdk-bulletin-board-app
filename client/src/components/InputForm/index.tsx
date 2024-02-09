import styles from "./styles.module.css";
import { useForm } from "react-hook-form";

interface Message {
  message: string;
}

function Input({ formSubmit, isLoading }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const onSubmit = (data: Message) => {
    formSubmit.mutate(data);
    reset();
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className={styles.inputWrapper}>
          <label style={{ marginBottom: "10px" }}>
            Enter your message here (limit 120 characters):
          </label>
          <div>
            <textarea
              className={styles.textarea}
              rows={5}
              maxLength={120}
              {...register("message", { required: true, maxLength: 120 })}
            />
            {errors.message && (
              <span className="text-error">Please enter a message</span>
            )}
          </div>
          <button type="submit" disabled={isLoading}>
            Submit
          </button>
        </div>
      </form>
    </>
  );
}

export default Input;
