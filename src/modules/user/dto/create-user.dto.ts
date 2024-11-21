import { IsNotEmpty, IsString, IsStrongPassword } from "class-validator";
import { BaseEmailDto } from "./base-email.dto";

export class CreateUserDto extends BaseEmailDto {
    @IsStrongPassword()
    @IsNotEmpty()
    @IsString()
    password: string;
}