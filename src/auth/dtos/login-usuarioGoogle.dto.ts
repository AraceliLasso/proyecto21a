import { IsString, IsNotEmpty } from 'class-validator';

export class LoginGoogleDto {
    @IsString()
    @IsNotEmpty()
    token: string;
}