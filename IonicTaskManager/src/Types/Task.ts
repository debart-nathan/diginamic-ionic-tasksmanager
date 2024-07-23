/**
 * Represents a task within the application, including details such as its identifier, label, completion status, and associated date.
 *
 * @interface Task
 */
export interface Task {
  /** Unique identifier for the task. */
  id?: string;

  /** A descriptive label for the task. */
  label: string;

  /** Indicates whether the task has been completed. */
  done: boolean;

  /** The date when the task was created or due. */
  date: Date;
}