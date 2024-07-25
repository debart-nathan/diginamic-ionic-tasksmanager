import React, { useEffect, useRef, useState } from "react";
import {
    IonList,
    IonItem,
    IonLabel,
    IonIcon,
    IonButton,
    IonModal,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
} from "@ionic/react";
import tasksCrudService from "../../services/TasksCrudService";
import { Task } from "../../Types/Task";
import TaskForm from "../TaskForm/TaskForm";
import "./TasksList.css";
import { v4 as uuidv4 } from "uuid";
import { checkmarkCircleOutline, closeCircleOutline } from "ionicons/icons";
import { LocalNotifications } from "@capacitor/local-notifications";

/**
 * Interface for TaskList component props.
 * Currently, this component does not accept any props.
 */
interface TaskListProps {}

/**
 * TaskList component.
 * Renders a list of tasks managed by the application. Users can view, edit, and delete tasks, as well as add new ones.
 * @example <TaskList />
 */
const TaskList: React.FC<TaskListProps> = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);

    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Refs for managing subscriptions
    const loadTasksSubscriptionRef = useRef<any>();
    const pushTaskSubscriptionRef = useRef<any>();

    useEffect(() => {
        loadTasks();
        // Set up an interval to call loadTasks every hour
        intervalRef.current = setInterval(loadTasks, 60 * 60 * 1000);
        // Cleanup function to unsubscribe from all subscriptions
        return () => {
            loadTasksSubscriptionRef.current?.unsubscribe();
            pushTaskSubscriptionRef.current?.unsubscribe();
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    /**
     * Checks if the task is due soon.
     * @param {Task} task - The task to check.
     * @returns {boolean} True if the task is due within the hour and is not done.
     */
    function isDueSoon(task: Task): boolean {
        const now = new Date();
        const dueDate = new Date(task.date);
        const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

        return dueDate <= oneHourFromNow && !task.done;
    }

    /**
     * Checks if a task is overdue.
     * @param {Task} task - The task to check.
     * @returns {boolean} True if the task is overdue and is not done.
     */
    function isOverdue(task: Task): boolean {
        const now = new Date();
        return task.date <= now && !task.done;
    }

    /**
     * Fetches the tasks and sets the state.
     */
    const loadTasks = async () => {
        loadTasksSubscriptionRef.current = tasksCrudService
            .fetchLocalTasks()
            .subscribe({
                next: (fetchedTasks) => {
                    setTasks(fetchedTasks);
                    fetchedTasks.forEach((task: Task) => {
                        overdueNotify(task);
                    });
                },
                error: (error) =>
                    alert(
                        `Erreur lors du chargement des taches: ${error.message}`
                    ),
            });
    };

    /**
     * Converts a UUID to a 32-bit integer representation.
     * @param {string} uuid - The UUID to convert.
     * @returns {number} The 32-bit integer representation of the UUID.
     */
    function hashId(uuid: string): number {
        let hash = 0;
        for (let i = 0; i < uuid.length; i++) {
            const char = uuid.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash;
    }

    /**
     * Schedules a notification for a task.
     * @param {Task} task - The task to notify about.
     * @param {string} message - The message to display in the notification.
     */
    const scheduleNotification = async (task: Task, message: string) => {
        if (task.id) {
            const numericId = hashId(task.id);
            await LocalNotifications.cancel({
                notifications: [{ id: numericId }],
            });
            await LocalNotifications.schedule({
                notifications: [
                    {
                        title: "Task Reminder",
                        body: message,
                        id: numericId,
                        schedule: { at: new Date(Date.now() + 1) },
                    },
                ],
            });
        }
    };

    /**
     * Calculates the delay until a task becomes overdue.
     * @param {Task} task - The task to calculate the delay for.
     * @returns {number} The delay in milliseconds.
     */
    const calculateDelayUntilOverdue = (task: Task): number => {
        const now = new Date().getTime();
        const dueDate = new Date(task.date).getTime();
        const delay = dueDate - now;
        return delay > 0 ? delay : 0;
    };

    /**
     * Notifies the user if a task is overdue or due soon.
     * @param {Task} task - The task to check.
     */
    const overdueNotify = async (task: Task) => {
        if (isOverdue(task)) {
            await scheduleNotification(
                task,
                `La tache "${task.label}" est en retard.`
            );
        } else if (isDueSoon(task)) {
            setTimeout(async () => {
                if (isOverdue(task)) {
                    await scheduleNotification(
                        task,
                        `La tache "${task.label}" est en retard.`
                    );
                }
            }, calculateDelayUntilOverdue(task));
        }
    };

    /**
     * Closes the form modal.
     */
    const closeForm = () => setShowForm(false);

    /**
     * Opens the form modal for adding a new task.
     */
    const startCreate = () => {
        setEditingTask(null);
        setShowForm(true);
    };

    /**
     * Opens the form modal for editing an existing task.
     * @param {Task} task - The task to edit.
     */
    const startEdit = (task: Task) => {
        setEditingTask(task);
        setShowForm(true);
    };

    /**
     * Saves a task, either creating a new one or updating an existing one.
     * @param {Task} newTask - The task object to save.
     */
    const handleSave = (newTask: Task) => {
        let updatedTasks = tasks;
        if (editingTask) {
            newTask.id = editingTask.id;
            updatedTasks = tasks.map((task) =>
                task.id === editingTask.id ? { ...task, ...newTask } : task
            );
        } else {
            /**
             * Generates a unique ID for a new task, ensuring it doesn't conflict with existing IDs.
             * @param {Array<string|undefined>} existingIDs - An array of existing task IDs.
             * @returns {string} A unique ID for the new task.
             */
            function generateUniqueID(
                existingIDs: Array<string | undefined>
            ): string {
                let id;
                do {
                    id = uuidv4();
                } while (existingIDs.includes(id));
                return id;
            }

            newTask.id = generateUniqueID(tasks.map((item) => item.id));
            updatedTasks.push(newTask);
        }
        overdueNotify(newTask);
        setTasks(updatedTasks);
        pushTaskSubscriptionRef.current = tasksCrudService
            .pushLocalTasks(updatedTasks)
            .subscribe({
                error: (error) =>
                    alert("Erreur lors de la modification de la tache"),
                complete: () => loadTasks(),
            });
    };

    /**
     * Deletes a task.
     * @param {string} taskId - The ID of the task to delete.
     */
    const handleDelete = (taskId: string) => {
        const updatedTasks = tasks.filter((task) => task.id !== taskId);
        setTasks(updatedTasks);
        pushTaskSubscriptionRef.current = tasksCrudService
            .pushLocalTasks(updatedTasks)
            .subscribe({
                error: (error) =>
                    alert("Erreur lors de la modification de la tache"),
                complete: () => loadTasks(),
            });
    };

    return (
        <div className="content-container">
            <IonButton className="submit-button" onClick={startCreate}>
                Ajouter une tâche
            </IonButton>
            <IonList>
                {tasks.map((task) => (
                    <IonItem
                        key={"ion-item-" + task.id}
                        className={task.done ? "task-done" : "task-not-done"}>
                        <div className="item-content-wrapper">
                            <div className="task-wrapper">
                                <div>
                                    <div className="task-label-wrapper">
                                        <IonIcon
                                            slot="start"
                                            icon={
                                                task.done
                                                    ? checkmarkCircleOutline
                                                    : closeCircleOutline
                                            }
                                            aria-label={
                                                task.done
                                                    ? "Tâche complétée"
                                                    : "Tâche non complétée"
                                            }
                                        />
                                        <h2>{task.label}</h2>
                                    </div>
                                    <p>
                                        Date et heure d'échéance :{" "}
                                        {task.date.toLocaleString()}
                                    </p>
                                </div>
                            </div>
                            <div>
                                <IonButton onClick={() => startEdit(task)}>
                                    Modifier
                                </IonButton>
                                <IonButton
                                    color="danger"
                                    onClick={() => handleDelete(task.id!)}>
                                    Supprimer
                                </IonButton>
                            </div>
                        </div>
                    </IonItem>
                ))}
            </IonList>
            <IonModal isOpen={showForm} onDidDismiss={() => closeForm()}>
                <IonHeader>
                    <IonToolbar className="toolbar">
                        <IonTitle>Ajout / Modification de la Tâche</IonTitle>
                        <IonButton fill="clear" onClick={closeForm}>
                            Fermer
                        </IonButton>
                    </IonToolbar>
                </IonHeader>
                <IonContent>
                    <TaskForm
                        isOpen={showForm}
                        onClose={closeForm}
                        onSave={handleSave}
                        {...(editingTask ? { initialTask: editingTask } : {})}
                    />
                </IonContent>
            </IonModal>
        </div>
    );
};

export default TaskList;
