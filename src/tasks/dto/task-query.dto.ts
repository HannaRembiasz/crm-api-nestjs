import { TaskPriority } from './create-task.dto.js';
import { TaskStatus } from './update-task.dto.js';

export class TaskQueryDto {
  title?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueAfter?: string;
  dueBefore?: string;
  companyId?: number;
  assignedToId?: number;
}