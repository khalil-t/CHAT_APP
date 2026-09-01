import {
  IsEmail,
  IsNotEmpty,
  Matches,
  maxLength,
  MaxLength,
  MinLength,
  IsDate,
} from 'class-validator';

export class SignUpDto {
  @IsEmail()
  @MaxLength(255)
  @IsNotEmpty()
  readonly email: string;

  @MinLength(8, {
    message: 'password too short',
  })
  @MaxLength(20, {
    message: 'password too long',
  })
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'password too weak',
  })
  @IsNotEmpty()
  readonly password: string;

  @IsNotEmpty()
  readonly passwordConfirm: string;

  @IsDate()
  readonly created_at: Date;
}
