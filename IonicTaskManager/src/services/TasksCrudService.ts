import { Observable, throwError } from "rxjs";
import { catchError, map, retry } from "rxjs/operators";
import { Task } from "../Types/Task"; // Import the Task interface
import { Storage } from "@ionic/storage";

/**
 * Service responsible for performing CRUD operations on tasks.
 *
 * @example
 * import TasksCrudService from './services/TasksCrudService';
 */
class TasksCrudService {
    /**
     * Base URL for the API endpoint where tasks are stored.
     */
    private apiUrl: string;
    private storage: Storage;

    /**
     * Constructor initializes the API URL and storage instance.
     */
    constructor() {
        // Set apiUrl based on the environment variable
        const url =
            import.meta.env.VITE_REACT_APP_BDD_API_URL ||
            "http://localhost:3000";
        this.apiUrl = url + "/tasks";
        this.storage = new Storage();
        this.storage.create();
    }

    /**
     * Fetches tasks from the server.
     * @returns An observable of the Tasks[] objects.
     */
    fetchTasks(): Observable<Task[]> {
        return new Observable<Task[]>((observer) => {
            fetch(this.apiUrl)
                .then((response) => {
                    if (!response.ok) {
                        throw new Error("Network response was not ok");
                    }
                    return response.json();
                })
                .then((tasks) => {
                    // Convert date strings to Date objects if necessary
                    tasks.forEach((task: Task) => {
                        if (typeof task.date === "string") {
                            task.date = new Date(task.date);
                        }
                    });

                    // Sort tasks by done status (not done first, then done)
                    const sortedTasks = tasks.sort((a: Task, b: Task) => {
                        // First, compare by done status
                        const doneComparison = +a.done - +b.done;
                        if (doneComparison !== 0) {
                            return doneComparison;
                        }

                        // If done status is equal, compare by date
                        return a.date.getTime() - b.date.getTime();
                    });

                    observer.next(sortedTasks);
                })
                .catch((error) => observer.error(error))
                .finally(() => observer.complete());
        }).pipe(
            retry(3),
            catchError((error) => {
                console.error("Error fetching tasks:", error);
                return throwError(
                    () => new Error("Failed to fetch tasks after 3 attempts")
                );
            }),
            map((response) => response)
        );
    }

    /**
     * Fetches tasks from local storage.
     * @returns An observable of the Tasks[] objects.
     */
    fetchLocalTasks(): Observable<Task[]> {
        return new Observable<Task[]>((observer) => {
            this.storage
                .get("tasks")
                .then((response) => {
                    if (!response) {
                        return [];
                    }

                    return response;
                })
                .then((tasks) => {
                    // Convert date strings to Date objects if necessary
                    tasks.forEach((task: Task) => {
                        if (typeof task.date === "string") {
                            task.date = new Date(task.date);
                        }
                    });

                    // Sort tasks by done status (not done first, then done)
                    const sortedTasks = tasks.sort((a: Task, b: Task) => {
                        // First, compare by done status
                        const doneComparison = +a.done - +b.done;
                        if (doneComparison !== 0) {
                            return doneComparison;
                        }

                        // If done status is equal, compare by date
                        return a.date.getTime() - b.date.getTime();
                    });

                    console.log("the current tasks :", JSON.stringify(tasks));
                    observer.next(sortedTasks);
                })
                .catch((error) => observer.error(error))
                .finally(() => observer.complete());
        }).pipe(
            retry(3),
            catchError((error) => {
                console.error("Error fetching tasks:", error);
                return throwError(
                    () => new Error("Failed to fetch tasks after 3 attempts")
                );
            }),
            map((response) => response)
        );
    }

    /**
     * Pushes tasks to local storage.
     * @param tasks The array of tasks to store.
     * @returns An observable of any.
     */
    pushLocalTasks(tasks: Task[]): Observable<any> {
        console.log("the current tasks :", JSON.stringify(tasks));
        return new Observable<any>((observer) => {
            this.storage
                .set("tasks", tasks)
                .then((data) => observer.next(data))
                .catch((error) => observer.error(error))
                .finally(() => observer.complete());
        }).pipe(
            retry(3),
            catchError((error) => {
                console.error("Error creating task:", error);
                return throwError(
                    () => new Error("Failed to create task after 3 attempts")
                );
            })
        );
    }

    /**
     * Creates a new task in the API.
     * @param task The task to create.
     * @returns An observable of the created Task object.
     */
    createTask(task: Task): Observable<Task> {
        return new Observable<Task>((observer) => {
            fetch(this.apiUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(task),
            })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error("Network response was not ok");
                    }
                    return response.json();
                })
                .then((data) => observer.next(data))
                .catch((error) => observer.error(error))
                .finally(() => observer.complete());
        }).pipe(
            retry(3),
            catchError((error) => {
                console.error("Error creating task:", error);
                return throwError(
                    () => new Error("Failed to create task after 3 attempts")
                );
            })
        );
    }

    /**
     * Updates an existing task in the API.
     * @param task The task to update.
     * @returns An observable of the updated Task object.
     */
    updateTask(task: Task): Observable<Task> {
        return new Observable<Task>((observer) => {
            fetch(`${this.apiUrl}/${task.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(task),
            })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error("Network response was not ok");
                    }
                    return response.json();
                })
                .then((data) => observer.next(data))
                .catch((error) => observer.error(error))
                .finally(() => observer.complete());
        }).pipe(
            retry(3),
            catchError((error) => {
                console.error("Error updating task:", error);
                return throwError(
                    () => new Error("Failed to update task after 3 attempts")
                );
            })
        );
    }

    /**
     * Deletes a task from the API by its ID.
     * @param id The ID of the task to delete.
     * @returns An observable indicating the operation's success.
     */
    deleteTask(id: string): Observable<void> {
        return new Observable<void>((observer) => {
            fetch(`${this.apiUrl}/${id}`, {
                method: "DELETE",
            })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error("Network response was not ok");
                    }
                    return null;
                })
                .then(() => observer.next())
                .catch((error) => observer.error(error))
                .finally(() => observer.complete());
        }).pipe(
            retry(3),
            catchError((error) => {
                console.error("Error deleting task:", error);
                return throwError(
                    () => new Error("Failed to delete task after 3 attempts")
                );
            })
        );
    }
}

export default new TasksCrudService(); // Exporting an instance of the service
