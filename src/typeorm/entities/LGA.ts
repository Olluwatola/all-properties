import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { State } from './State';

@Entity()
export class LGA {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  alias: string; // Unique LGA alias

  @ManyToOne(() => State, (state) => state.lgas, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  state: State;
}
