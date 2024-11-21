import { Transform } from "class-transformer";
import { IsEmail, IsNotEmpty } from "class-validator";

export class BaseEmailDto {
    @IsEmail()
    @IsNotEmpty()
    @Transform(({ value }) => value.toLocaleLowerCase())
    email: string;
}
