import { AutoMap } from '@automapper/classes';
import { Exclude } from 'class-transformer';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Role } from './role.model';
import { RoleDto } from '../dtos/responses/role/role.dto';

@Entity({name: "nestjs_users"})
export class User {
  @AutoMap()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @AutoMap()
  @Column()
  firstName: string;

  @AutoMap()
  @Column()
  lastName: string;

  @AutoMap()
  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  hash: string;

  @AutoMap()
  @Column({ default: true })
  isActive: boolean;

  @AutoMap()
  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @AutoMap()
  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @AutoMap(() => RoleDto)
  @ManyToMany(() => Role, (role) => role.users,{
    cascade: true,
  })
  @JoinTable()
  roles: Role[];
}

export class UserModel {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  @Exclude()
  hash: string;

  constructor(partial: Partial<UserModel>) {
    Object.assign(this, partial);
  }
}