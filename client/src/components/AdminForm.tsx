import { useState } from "react";
import { useForm } from "react-hook-form";

// components
import Modal from "./Modal";

// types
import { AdminFormValues } from "@/types";
import { themes } from "@/context/constants";
import { ThemeType } from "@/context/types";

export const AdminForm = ({
  handleResetScene,
  handleRemoveScene,
  handleSubmitForm,
  isLoading,
  theme,
}: {
  handleResetScene: (shouldHardReset: boolean) => void;
  handleRemoveScene: () => void;
  handleSubmitForm: (data: AdminFormValues) => void;
  isLoading: boolean;
  theme: ThemeType;
}) => {
  const { id, title, subtitle, description } = theme;

  const [areButtonsDisabled, setAreButtonsDisabled] = useState(false);
  const [showChangeSceneModal, setShowChangeSceneModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [shouldHardReset, setShouldHardReset] = useState(false);
  const [formData, setFormData] = useState<AdminFormValues>(theme);

  const { handleSubmit, register } = useForm<AdminFormValues>();

  const onSubmit = handleSubmit((data) => {
    setFormData(data);
    if (data.id !== id) setShowChangeSceneModal(true);
    else handleSubmitForm(data);
  });

  const confirmSubmit = () => {
    handleSubmitForm(formData);
    setShowChangeSceneModal(false);
  };

  const removeScene = async () => {
    setShowRemoveModal(false);
    setAreButtonsDisabled(true);
    await handleRemoveScene();
    setAreButtonsDisabled(false);
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
        <div className="grid gap-4 mb-4">
          <p>
            Theme: Update the scene/design of the layout. If you make a change, the existing scene will be removed and
            the new one will be added to the world.
          </p>
          <div>
            <label>Theme:</label>
            <select className="input" {...register("id", { required: true, value: id })}>
              {(() => {
                return Object.values(themes)
                  .filter((t) => t.group === themes[id as keyof typeof themes]?.group)
                  .map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title}
                    </option>
                  ));
              })()}
            </select>
          </div>
          <p>
            The following items will be visible to all users on the main page of the app. These settings will not affect
            the scene or experience within the world itself.
          </p>
          <ul className="p2">
            <li>• Title</li>
            <li>• Subtitle</li>
            <li>• Description</li>
          </ul>
          <div>
            <label>Title:</label>
            <input className="input" {...register("title", { required: true, value: title })} />
          </div>
          <div>
            <label>Subtitle:</label>
            <input className="input" {...register("subtitle", { required: true, value: subtitle })} />
          </div>
          <div>
            <label>Description:</label>
            <textarea className="input" {...register("description", { value: description })} />
          </div>
        </div>
        <button className="btn mb-2" disabled={isLoading || areButtonsDisabled} type="submit">
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
          text="You’ve selected a new theme for this app. Replacing the scene will permanently delete all existing user submissions. This action cannot be undone. While you can switch back to a previous theme later, the deleted data cannot be recovered. Are you sure you want to continue and replace the scene?"
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
            Remove all user submissions?
          </label>
        </Modal>
      )}

      {showRemoveModal && (
        <Modal
          buttonText="Remove"
          onConfirm={removeScene}
          setShowModal={setShowRemoveModal}
          text="You’re about to remove this app from the world. All associated data will be permanently deleted and cannot be recovered. If you want to use this app again in the future, you’ll need to re-download it. Are you sure you want to continue?"
          title="Remove from World"
        />
      )}
    </>
  );
};

export default AdminForm;
