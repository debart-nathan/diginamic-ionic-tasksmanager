import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
    IonContent,
    IonHeader,
    IonPage,
    IonTitle,
    IonToolbar,
    IonInput,
    IonButton,
    IonCheckbox,
} from "@ionic/react";
import { Task } from "../../Types/Task";

/**
 * Define props for the TaskForm component
 */
interface TaskFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (task: Task) => void;
    initialTask?: Task | null;
}

/**
 * TaskForm Component
 * A form component used for adding or editing tasks.
 * It uses react-hook-form for form management and Ionic components for UI elements.
 * @component
 * @example <TaskForm isOpen={true} onClose={() => {}} onSave={(task) => {}} />
 */
const TaskForm: React.FC<TaskFormProps> = ({
    isOpen,
    onClose,
    onSave,
    initialTask,
}) => {

    /**
     * useForm hook from react-hook-form for managing form state and validation.
     */
    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
    } = useForm();

    /**
     * State to track whether the task is completed.
     */
    const [done, setDone] = useState(false);

    /**
     * Effect hook to initialize form values when the component mounts or initialTask changes.
     * @param initialTask The initial task data to populate the form.
     */
    useEffect(() => {
        if (initialTask) {
            setValue("label", initialTask.label);
            const dateString =
                initialTask.date.toISOString().split("T")[0] +
                "T" +
                initialTask.date.toLocaleTimeString();
            setValue("date", dateString);
            setValue("done", initialTask.done);
            setDone(initialTask.done);
            if (initialTask?.done) {
                const checkbox = document.querySelector("ion-checkbox");
                if (checkbox) {
                    checkbox.setAttribute("checked", "true");
                }
            }
        }
    }, [initialTask, setValue]);

    /**
     * Function to handle form submission.
     * Validates input, constructs a new task object, and calls onSave callback.
     * @param formData Form data submitted by the user.
     */
    const onSubmit = (formData: any) => {
        if (!formData.label.trim()) {
            console.error("Label is required.");
            return;
        }

        if (!formData.date) {
            console.error("Date is required.");
            return;
        }

        //checkbox use the checked attribut instead of value to save it's state
        const checkboxElement = document.querySelector("ion-checkbox");
        if (checkboxElement) {
            formData.done = checkboxElement.checked;
        }else{
            formData.done = false;
        }

        const newTask: Task = {
            label: formData.label,
            date: new Date(formData.date),
            done: formData.done,
        };

        onSave(newTask);
        onClose();
    };

    /**
     * Renders the TaskForm component with form fields and buttons.
     */
    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Ajout / Modification de la Tâche</IonTitle>
                    <IonButton fill="clear" onClick={onClose}>
                        Fermer
                    </IonButton>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <IonInput
                        {...register("label", {
                            required: "Label is required.",
                        })}
                        placeholder="Étiquette de la tâche"
                    />
                    {errors.label && <p>{String(errors.label.message)}</p>}
                    
                    <IonInput
                        type="datetime-local"
                        {...register("date", { required: "Date is required." })}
                        placeholder="Date et heure d'échéance"
                    />
                    {errors.date && <p>{String(errors.date.message)}</p>}
                    
                    <IonCheckbox {...register("done")}></IonCheckbox>
                    <IonButton expand="full" type="submit" disabled={!isOpen}>
                        Soumettre
                    </IonButton>
                </form>
            </IonContent>
        </IonPage>
    );
};

export default TaskForm;