import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('equipment')
export class Equipment {
  @PrimaryGeneratedColumn()
  id_equipment!: number;

  @Column({ type: 'varchar', length: 255, unique: true })
  name_equipment!: string;

  @Column({ type: 'varchar', length: 500, default: '' })
  description!: string;

  @Column({ type: 'integer', default: 1 })
  status_equipment!: number;
}
