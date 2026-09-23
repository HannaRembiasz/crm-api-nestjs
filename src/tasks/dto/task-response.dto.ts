import { ApiProperty } from '@nestjs/swagger';
import { TaskPriority } from './create-task.dto.js';
import { TaskStatus } from './update-task.dto.js';

export class TaskResponseDto {
  @ApiProperty({
    example: 1,
    description: 'Unique task identifier.',
  })
  id: number;

  @ApiProperty({
    example: 'Call client',
    description: 'Task title.',
  })
  title: string;

  @ApiProperty({
    enum: TaskStatus,
    example: TaskStatus.TODO,
    description: 'Current task status.',
  })
  status: TaskStatus;

  @ApiProperty({
    enum: TaskPriority,
    example: TaskPriority.HIGH,
    description: 'Task priority.',
  })
  priority: TaskPriority;

  @ApiProperty({
    example: 1,
    description: 'ID of the company associated with the task.',
  })
  companyId: number;

  @ApiProperty({
    example: 7,
    nullable: true,
    description: 'ID of the user assigned to the task.',
  })
  assignedToId: number | null;

  @ApiProperty({
    example: '2026-09-14 12:19:31.891653+00',
    description: 'Task creation timestamp.',
  })
  createdAt: string;

  @ApiProperty({
    example: '2026-09-14 12:19:31.891653+00',
    description: 'Timestamp of the last task update.',
  })
  updatedAt: string;
}