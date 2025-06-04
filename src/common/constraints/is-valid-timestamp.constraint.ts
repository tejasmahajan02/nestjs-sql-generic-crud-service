import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'IsValidTimestamp', async: false })
export class IsValidTimestampConstraint
  implements ValidatorConstraintInterface
{
  validate(value: any, _args: ValidationArguments): boolean {
    return typeof value === 'number' && !isNaN(new Date(value).getTime());
  }

  defaultMessage(args: ValidationArguments): string {
    return `${args.property} must be a valid timestamp (like Date.now())`;
  }
}
