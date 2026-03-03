import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("todo_recurrences")
export class TodoRecurrence {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "tinyint", width: 1, default: 0 })
  repeat!: number;

  @Column()
  weeklyInterval!: number;

  @Column("simple-array")
  weeklyDays!: number[];

  @Column({ type: "varchar", nullable: true })
  weeklyEnd!: number | null;
}