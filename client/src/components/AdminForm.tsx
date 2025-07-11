import { useState } from "react";
import { useForm } from "react-hook-form";

// components
import Modal from "./Modal";

// types
import { AdminFormValues } from "@/types";
import { themes } from "@/context/constants";

// utils
import { backendAPI } from "@/utils/backendAPI";
import { getErrorMessage } from "@/utils/getErrorMessage";

export function AdminForm({
  handleResetScene,
  handleSubmitForm,
  isLoading,
  setErrorMessage,
  theme,
}: {
  handleResetScene: (shouldHardReset: boolean) => void;
  handleSubmitForm: (data: AdminFormValues) => void;
  isLoading: boolean;
  setErrorMessage: (value: string) => void;
  theme: {
    id: string;
    description: string;
    subtitle: string;
    title: string;
  };
}) {
  const [areButtonsDisabled, setAreButtonsDisabled] = useState(false);
  const [showChangeSceneModal, setShowChangeSceneModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [shouldHardReset, setShouldHardReset] = useState(false);
  const [formData, setFormData] = useState<AdminFormValues>(theme);

  const { handleSubmit, register } = useForm<AdminFormValues>();

  const onSubmit = handleSubmit((data) => {
    setFormData(data);
    if (data.id !== theme.id) setShowChangeSceneModal(true);
    else handleSubmitForm(data);
  });

  const confirmSubmit = () => {
    handleSubmitForm(formData);
    setShowChangeSceneModal(false);
  };

  const removeScene = async () => {
    setErrorMessage("");
    setShowRemoveModal(false);
    setAreButtonsDisabled(true);
    backendAPI.post("/admin/remove", { theme }).catch((error) => setErrorMessage(getErrorMessage(error)));
  };

  const onResetScene = async () => {
    setAreButtonsDisabled(true);
    await handleResetScene(shouldHardReset);
    setShowResetModal(false);
    setAreButtonsDisabled(false);
  };

  return (
    <>
      <form onSubmit={onSubmit}>
        <label>Theme:</label>
        <select className="input mb-4" {...register("id", { required: true, value: theme.id })}>
          {(() => {
            return Object.values(themes)
              .filter((t) => t.group === themes[theme.id as keyof typeof themes]?.group)
              .map((t) => (
                <option key={t.id} value={t.id}>
                  {t.id}
                </option>
              ));
          })()}
        </select>
        <label>Title:</label>
        <input className="input mb-4" {...register("title", { required: true, value: theme.title })} />
        <label>Subtitle:</label>
        <input className="input mb-4" {...register("subtitle", { required: true, value: theme.subtitle })} />
        <label>Description:</label>
        <textarea className="input mb-4" {...register("description", { value: theme.description })} />
        <button className="btn my-2" disabled={isLoading || areButtonsDisabled} type="submit">
          Submit
        </button>
        <button
          className="btn btn-danger-outline mb-2"
          disabled={isLoading || areButtonsDisabled}
          onClick={() => setShowResetModal(true)}
        >
          Reset
        </button>
        <button
          className="btn btn-danger"
          disabled={isLoading || areButtonsDisabled}
          onClick={() => setShowRemoveModal(true)}
        >
          Remove from world
        </button>
      </form>

      {showChangeSceneModal && (
        <Modal
          buttonText="Replace"
          onConfirm={confirmSubmit}
          setShowModal={setShowChangeSceneModal}
          text="This will remove this instance of the Bulletin Board and all associated data permanently and then replace it with your newly selected scene. Are you sure you'd like to continue?"
          title="Replace Scene in World"
        />
      )}

      {showResetModal && (
        <Modal
          buttonText="Reset"
          onConfirm={onResetScene}
          setShowModal={setShowResetModal}
          text="This will reset this instance of the Bulletin Board and optionally remove all remove associated data permanently. Are you sure you'd like to continue?"
          title="Reset Scene"
        >
          <label className="label p3 text-left">
            <input
              checked={shouldHardReset}
              className="input-checkbox input-error"
              type="checkbox"
              onChange={(event) => setShouldHardReset(event.target.checked)}
            />
            Remove all dropped and pending messages?
          </label>
        </Modal>
      )}

      {showRemoveModal && (
        <Modal
          buttonText="Remove"
          onConfirm={removeScene}
          setShowModal={setShowRemoveModal}
          text="This will remove this instance of the Bulletin Board and all associated data permanently. Are you sure you'd like to continue?"
          title="Remove from World"
        />
      )}
    </>
  );
}

export default AdminForm;
