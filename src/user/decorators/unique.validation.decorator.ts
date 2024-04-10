import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { registerDecorator, ValidationArguments, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { EntityManager } from 'typeorm';

@Injectable()
@ValidatorConstraint({ async: true })
export class UniqueExistConstraint implements ValidatorConstraintInterface {
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ){}
  async validate(value: any, args: ValidationArguments) {
    const e: any= args.object.constructor;
    const entity = args.object[`class_entity_${args.property}`];
    const dataExist = await this.entityManager
        .getRepository(entity)
        .createQueryBuilder()
        .where({ [args.property]: value })
        .getExists();
    return !dataExist;  
  }
}

export function Unique(entity: Function, validationOptions?: ValidationOptions) {
  validationOptions = { ...{ message: '$value already exists.' }, ...validationOptions };
  return function (object: Object, propertyName: string) {
    object[`class_entity_${propertyName}`] = entity;
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: UniqueExistConstraint,
    });
  };
}