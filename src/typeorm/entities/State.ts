import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { LGA } from './LGA';

@Entity()
export class State {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  alias: string;

  @OneToMany(() => LGA, (lga) => lga.state)
  lgas: LGA[];
}
