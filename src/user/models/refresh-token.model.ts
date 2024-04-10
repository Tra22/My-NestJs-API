import {
    Entity,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    OneToOne,
    JoinColumn,
    Column,
  } from 'typeorm';
  import { User } from './user.model';
  
  @Entity({name: "nestjs_refresh_token"})
  export class RefreshToken {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @OneToOne((type) => User,{ onDelete: 'CASCADE' })
    @JoinColumn()
    user: User;
  
    @Column()
    token: string;
  
    @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;
  
    @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    updatedAt: Date;
  }