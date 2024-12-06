import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  sessionId: string;

  @Column('decimal')
  amount: number;

  @Column()
  status: string;

  @Column()
  userEmail: string;

  @Column()
  membershipId: string;

  @Column()
  date: Date;
}
