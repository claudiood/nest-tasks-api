import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { TaskStatus } from '../entities/task.entity';

export class ReplaceTaskDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  assignee: string;

  @IsDateString()
  dueDate: string;

  @IsEnum(TaskStatus)
  status: TaskStatus;
}
