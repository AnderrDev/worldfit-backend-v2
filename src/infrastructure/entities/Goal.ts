import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('goal')
export class Goal {
  @PrimaryGeneratedColumn()
  id_goal!: number;

  @Column({ type: 'varchar', length: 255, unique: true })
  name_goal!: string;

  @Column({ type: 'varchar', length: 500, default: '' })
  description!: string;

  @Column({ type: 'integer', default: 1 })
  status_goal!: number;
}
