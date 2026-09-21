import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

export function IsAfterOrEqual(
  property: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isAfterOrEqual',
      target: object.constructor,
      propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: string, args: ValidationArguments) {
          const [relatedProperty] = args.constraints;
          const relatedValue = (args.object as Record<string, string | undefined>)[
            relatedProperty
          ];

          if (!value || !relatedValue) {
            return true;
          }

          return new Date(value) >= new Date(relatedValue);
        },
      },
    });
  };
}