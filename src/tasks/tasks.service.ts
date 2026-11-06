import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { CreateTaskDto } from './dto/create-task.dto';
import { ReplaceTaskDto } from './dto/replace-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task, TaskStatus } from './entities/task.entity';

type StoredTask = Omit<Task, 'dueDate' | 'createdAt' | 'updatedAt'> & {
  dueDate: string;
  createdAt: string;
  updatedAt: string;
};

@Injectable()
export class TasksService implements OnModuleInit {
  private readonly filePath = resolve(
    process.env.TASKS_FILE ?? 'data/tasks.json',
  );
  private tasks: Task[] = [];
  private nextId = 1;
  private writeQueue: Promise<void> = Promise.resolve();

  async onModuleInit(): Promise<void> {
    this.tasks = await this.load();
    this.nextId = this.tasks.reduce((max, t) => Math.max(max, t.id), 0) + 1;
  }

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

  async create(dto: CreateTaskDto): Promise<Task> {
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
    await this.save();
    return task;
  }

  async replace(id: number, dto: ReplaceTaskDto): Promise<Task> {
    const task = this.findOne(id);
    task.title = dto.title;
    task.description = dto.description;
    task.assignee = dto.assignee;
    task.dueDate = new Date(dto.dueDate);
    task.status = dto.status;
    task.updatedAt = new Date();
    await this.save();
    return task;
  }

  async update(id: number, dto: UpdateTaskDto): Promise<Task> {
    const task = this.findOne(id);
    if (dto.title !== undefined) task.title = dto.title;
    if (dto.description !== undefined) task.description = dto.description;
    if (dto.assignee !== undefined) task.assignee = dto.assignee;
    if (dto.dueDate !== undefined) task.dueDate = new Date(dto.dueDate);
    if (dto.status !== undefined) task.status = dto.status;
    task.updatedAt = new Date();
    await this.save();
    return task;
  }

  async remove(id: number): Promise<void> {
    const index = this.tasks.findIndex((t) => t.id === id);
    if (index === -1) {
      throw new NotFoundException(`Task ${id} not found`);
    }
    this.tasks.splice(index, 1);
    await this.save();
  }

  private async load(): Promise<Task[]> {
    let content: string;
    try {
      content = await readFile(this.filePath, 'utf-8');
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return [];
      }
      throw error;
    }
    const stored = JSON.parse(content) as StoredTask[];
    return stored.map((t) => ({
      ...t,
      dueDate: new Date(t.dueDate),
      createdAt: new Date(t.createdAt),
      updatedAt: new Date(t.updatedAt),
    }));
  }

  private save(): Promise<void> {
    const data = JSON.stringify(this.tasks, null, 2);
    this.writeQueue = this.writeQueue
      .catch(() => undefined)
      .then(async () => {
        const tmpPath = `${this.filePath}.tmp`;
        await mkdir(dirname(this.filePath), { recursive: true });
        await writeFile(tmpPath, data, 'utf-8');
        await rename(tmpPath, this.filePath);
      });
    return this.writeQueue;
  }
}
