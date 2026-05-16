import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreatePageDto {
  @IsString()
  @Matches(/^[a-z0-9-]{1,64}$/, { message: 'slug must be lowercase letters, digits and dashes (max 64)' })
  slug!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(120)
  title!: string;
}

export class UpdatePageDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  title?: string;
}

export class CreateBlockDto {
  @IsString()
  @MaxLength(64)
  type!: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;

  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @IsObject()
  data!: Record<string, unknown>;
}

export class UpdateBlockDto {
  @IsOptional()
  @IsString()
  @MaxLength(64)
  type?: string;

  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;

  @IsOptional()
  @IsObject()
  data?: Record<string, unknown>;
}

export class ReorderBlocksDto {
  @IsArray()
  @ArrayMaxSize(200)
  @IsInt({ each: true })
  orderedIds!: number[];
}

export class SeoDto {
  @IsString()
  @MinLength(1)
  @MaxLength(160)
  title!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(320)
  description!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  keywords?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  ogImage?: string;
}
