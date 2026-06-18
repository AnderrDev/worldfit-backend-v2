import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('category')
export class Category {
  @PrimaryGeneratedColumn()
  id_category!: number;

  @Column({ type: 'varchar', length: 255, unique: true })
  name_category!: string;

  @Column({ type: 'varchar', length: 500, default: '' })
  description!: string;

  @Column({ type: 'integer', default: 1 })
  status_category!: number;
}
