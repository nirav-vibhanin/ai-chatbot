import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';

export class CreateChatDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(1000)
  message: string;
} 