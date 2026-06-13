import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('exercise')
export class Exercise {
  @PrimaryGeneratedColumn()
  id_exercise!: number;

  @Column({ type: 'varchar', length: 255 })
  name_exercise!: string;

  @Column({ type: 'varchar', length: 500, default: '' })
  description!: string;

  @Column({ type: 'varchar', length: 50 })
  muscle_group!: string;

  @Column({ type: 'integer' })
  sets!: number;

  @Column({ type: 'integer' })
  reps!: number;

  @Column({ type: 'integer', default: 1 })
  status_exercise!: number;
}
