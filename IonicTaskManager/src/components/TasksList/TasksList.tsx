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
import { v4 as uuidv4 } from 'uuid';
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
    const pushTaskSubscriptionRef = useRef<any>();

    useEffect(() => {
        loadTasks();
        // Cleanup function to unsubscribe from all subscriptions
        return () => {
            loadTasksSubscriptionRef.current?.unsubscribe();
            pushTaskSubscriptionRef.current?.unsubscribe();
        };
    }, []);

    const loadTasks = () => {
        loadTasksSubscriptionRef.current = tasksCrudService
            .fetchLocalTasks()
            .subscribe({
                next: (fetchedTasks) => setTasks(fetchedTasks),
                error: (error) =>
                    alert(
                        `Erreur lors du chargement des taches: ${error.message}`
                    ),
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
    const handleSave =(newTask: Task) => {
        let updatedTasks = tasks;
        if (editingTask) {
            newTask.id = editingTask.id;
            // Update existing task
            updatedTasks = tasks.map((task) =>
                task.id === editingTask.id ? { ...task, ...newTask } : task
            );
        } else {

            function generateUniqueID(existingIDs:(string|undefined)[]) {
                let id;
                do {
                    id = uuidv4();
                } while (existingIDs.includes(id));
                return id;
            }
            newTask.id = generateUniqueID(tasks.map((item) => item.id));
            updatedTasks.push(newTask)
        }
        setTasks(updatedTasks);
        pushTaskSubscriptionRef.current = tasksCrudService
            .pushLocalTasks(updatedTasks)
            .subscribe({
                error: (error) => {
                    alert("Erreur lors de la modification de la tache");
                    loadTasks();
                },
            });
    };

    /**
     * Handles removing a task
     * @param taskId the id of the task to delete
     */
    const handleDelete = (taskId: string) => {
        const updatedTasks= tasks.filter((task) => task.id !== taskId)
        setTasks(updatedTasks);
        pushTaskSubscriptionRef.current = tasksCrudService
            .pushLocalTasks(updatedTasks)
            .subscribe({
                error: (error) => {
                    alert("Erreur lors de la modification de la tache");
                    loadTasks();
                },
            });
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
                        <IonItem
                            key={"ion-item-" + task.id}
                            className={
                                task.done ? "task-done" : "task-not-done"
                            }>
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
