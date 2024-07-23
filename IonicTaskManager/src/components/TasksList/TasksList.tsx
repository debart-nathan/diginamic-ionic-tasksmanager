/**
 * Renders a list of tasks managed by the application.
 * Users can view, edit, and delete tasks, as well as add new ones.
 *
 * @component
 * @example
 * <TaskList />
 */
import React, { useEffect, useRef, useState } from "react";
import {
    IonContent,
    IonHeader,
    IonPage,
    IonTitle,
    IonToolbar,
    IonList,
    IonItem,
    IonLabel,
    IonIcon,
    IonButton,
    IonModal,
} from "@ionic/react";
import tasksCrudService from "../../services/TasksCrudService";
import { Task } from "../../Types/Task";
import TaskForm from "../TaskForm/TaskForm";
import "./TasksList.css";
import { checkmarkCircleOutline, closeCircleOutline } from "ionicons/icons";

/**
 * TaskList component props type definition.
 * Currently, this component does not accept any props.
 */
interface TaskListProps {}

const TaskList: React.FC<TaskListProps> = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);

    // Refs for managing subscriptions
    const loadTasksSubscriptionRef = useRef<any>();
    const createTaskSubscriptionRef = useRef<any>();
    const updateTaskSubscriptionRef = useRef<any>();
    const deleteTaskSubscriptionRef = useRef<any>();

    useEffect(() => {
        loadTasks();
        // Cleanup function to unsubscribe from all subscriptions
        return () => {
            loadTasksSubscriptionRef.current?.unsubscribe();
            createTaskSubscriptionRef.current?.unsubscribe();
            updateTaskSubscriptionRef.current?.unsubscribe();
            deleteTaskSubscriptionRef.current?.unsubscribe();
        };
    }, []);

    const loadTasks = () => {
        loadTasksSubscriptionRef.current = tasksCrudService
            .fetchTasks()
            .subscribe({
                next: (fetchedTasks) => setTasks(fetchedTasks),
                error: (error) =>
                    alert(`Error loading tasks: ${error.message}`),
            });
    };

    const closeForm = () => setShowForm(false);

    const startCreate = () => {
        setEditingTask(null);
        setShowForm(true);
    };

    const startEdit = (task: Task) => {
        setEditingTask(task);
        setShowForm(true);
    };

    /**
     * Handles saving a task, either creating a new one or updating an existing one.
     * @param newTask The task object to save.
     */
    const handleSave = (newTask: Task) => {
        if (editingTask) {
            newTask.id = editingTask.id;
            // Update existing task
            const updatedTasks = tasks.map((task) =>
                task.id === editingTask.id ? { ...task, ...newTask } : task
            );
            setTasks(updatedTasks);
            updateTaskSubscriptionRef.current = tasksCrudService
                .updateTask(newTask)
                .subscribe({
                    error: (error) => {
                        alert("Erreur lors de la modification de la tache");
                        loadTasks();
                    },
                });
        } else {
            // Add new task
            setTasks((current_tasks) => [...current_tasks, newTask]);
            createTaskSubscriptionRef.current = tasksCrudService
                .createTask(newTask)
                .subscribe({
                    error: (error) => {
                        alert("Erreur lors de la creation de la tache");
                        loadTasks();
                    },
                });
        }
    };

    /**
     * Handles removing a task
     * @param taskId the id of the task to delete
     */
    const handleDelete = (taskId: string) => {
        setTasks((tasks) => tasks.filter((task) => task.id !== taskId));
        deleteTaskSubscriptionRef.current = tasksCrudService
            .deleteTask(taskId)
            .subscribe(() => {});
    };

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Gestion des Tâches</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <IonButton onClick={startCreate}>Ajouter une tâche</IonButton>
                <IonList>
                    {tasks.map((task) => (
                        <IonItem key={"ion-item-" + task.id}>
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
                            <IonLabel>
                                <h3>{task.label}</h3>
                                <p>
                                    Date et heure d'échéance :{" "}
                                    {task.date.toLocaleString()}
                                </p>
                            </IonLabel>
                            <IonButton onClick={() => startEdit(task)}>
                                Modifier
                            </IonButton>
                            <IonButton
                                color="danger"
                                onClick={() => handleDelete(task.id!)}>
                                Supprimer
                            </IonButton>
                        </IonItem>
                    ))}
                </IonList>
                <IonModal isOpen={showForm} onDidDismiss={() => closeForm()}>
                    <TaskForm
                        isOpen={showForm}
                        onClose={closeForm}
                        onSave={handleSave}
                        {...(editingTask ? { initialTask: editingTask } : {})}
                    />
                </IonModal>
            </IonContent>
        </IonPage>
    );
};

export default TaskList;
