import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn()
  id_user!: number;

  @Column({ type: 'varchar', length: 255 })
  name_user!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email!: string;

  @Column({ type: 'varchar', length: 255 })
  password!: string;

  @Column({ type: 'varchar', length: 20, default: 'user' })
  role_user!: string;

  @Column({ type: 'integer', default: 1 })
  status_user!: number;
}
