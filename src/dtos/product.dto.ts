import { IsString, IsNumber, IsInt, Min, MinLength, IsOptional, IsMongoId } from 'class-validator';
import { Exclude, Expose } from 'class-transformer';
import { isObjectIdOrHexString } from 'mongoose';

@Exclude()
export class CreateProductDto {
    @Expose()
    @IsString()
    @MinLength(1)
    name!: string;

    @Expose()
    @IsString()
    @MinLength(1)
    description!: string;

    @Expose()
    @IsNumber()
    @Min(0)
    price!: number;

    @Expose()
    @IsInt()
    @Min(0)
    stock!: number;

    @Expose()
    @IsString()
    @MinLength(1)
    sku!: string;
}

@Exclude()
export class UpdateProductDto {
    @Expose()
    @IsString()
    @MinLength(1)
    @IsOptional()
    name?: string;

    @Expose()
    @IsString()
    @MinLength(1)
    @IsOptional()
    description?: string;

    @Expose()
    @IsNumber()
    @Min(0)
    @IsOptional()
    price?: number;

    @Expose()
    @IsInt()
    @Min(0)
    @IsOptional()
    stock?: number;

    @Expose()
    @IsString()
    @MinLength(1)
    @IsOptional()
    sku?: string;
}

@Exclude()
export class ProductParamsDto {
    @Expose()
    @IsString()
    @MinLength(1)
    @IsMongoId()
    id!: string;
}

@Exclude()
export class ProductResponseDto {
    @Expose()
    id!: string;

    @Expose()
    name!: string;

    @Expose()
    description!: string;

    @Expose()
    price!: number;

    @Expose()
    stock!: number;

    @Expose()
    sku!: string;

    @Expose()
    createdAt!: Date;

    @Expose()
    updatedAt!: Date;
}