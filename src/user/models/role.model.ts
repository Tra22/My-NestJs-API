import { AutoMap } from '@automapper/classes';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Permission } from './permission.model';
import { User } from './user.model';
import { PermissionDto } from '../dtos/responses/permission/permission.dto';

@Entity({name: "nestjs_roles"})
export class Role {
  @AutoMap()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @AutoMap()
  @Column()
  name: string;

  @AutoMap()
  @Column()
  description: string;
  
  @AutoMap()
  @Column({ default: true })
  isActive: boolean;

  @AutoMap()
  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @AutoMap()
  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @ManyToMany(() => User, (user) => user.roles)
  @JoinTable()
  users: User[];

  @AutoMap(() => PermissionDto)
  @ManyToMany(() => Permission, (permission) => permission.roles,{
    cascade: true,
  })
  @JoinTable()
  permissions: Permission[];
}