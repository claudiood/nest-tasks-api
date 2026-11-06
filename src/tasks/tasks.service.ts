import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { ReplaceTaskDto } from './dto/replace-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task, TaskStatus } from './entities/task.entity';

@Injectable()
export class TasksService {
  private tasks: Task[] = [];
  private nextId = 1;

  findAll(): Task[] {
    return this.tasks;
  }

  findOne(id: number): Task {
    const task = this.tasks.find((t) => t.id === id);
    if (!task) {
      throw new NotFoundException(`Task ${id} not found`);
    }
    return task;
  }

  create(dto: CreateTaskDto): Task {
    const now = new Date();
    const task: Task = {
      id: this.nextId++,
      title: dto.title,
      description: dto.description,
      assignee: dto.assignee,
      dueDate: new Date(dto.dueDate),
      status: dto.status ?? TaskStatus.PENDING,
      createdAt: now,
      updatedAt: now,
    };
    this.tasks.push(task);
    return task;
  }

  replace(id: number, dto: ReplaceTaskDto): Task {
    const task = this.findOne(id);
    task.title = dto.title;
    task.description = dto.description;
    task.assignee = dto.assignee;
    task.dueDate = new Date(dto.dueDate);
    task.status = dto.status;
    task.updatedAt = new Date();
    return task;
  }

  update(id: number, dto: UpdateTaskDto): Task {
    const task = this.findOne(id);
    if (dto.title !== undefined) task.title = dto.title;
    if (dto.description !== undefined) task.description = dto.description;
    if (dto.assignee !== undefined) task.assignee = dto.assignee;
    if (dto.dueDate !== undefined) task.dueDate = new Date(dto.dueDate);
    if (dto.status !== undefined) task.status = dto.status;
    task.updatedAt = new Date();
    return task;
  }

  remove(id: number): void {
    const index = this.tasks.findIndex((t) => t.id === id);
    if (index === -1) {
      throw new NotFoundException(`Task ${id} not found`);
    }
    this.tasks.splice(index, 1);
  }
}
