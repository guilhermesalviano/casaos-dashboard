import { Entity, PrimaryGeneratedColumn, Column, JoinColumn, OneToOne } from "typeorm";
import { TodoRecurrence } from "./TodoRecurrence";
import { TodoCheck } from "./TodoCheck";

@Entity("todos")
export class Todo {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  title!: string;

  @Column({ type: "varchar", nullable: true })
  priority!: string | null;

  @Column()
  createdAt!: Date;

  @OneToOne(() => TodoCheck, { cascade: true })
  @JoinColumn()
  check!: TodoCheck;

  @OneToOne(() => TodoRecurrence, { cascade: true })
  @JoinColumn()
  recurrence!: TodoRecurrence;
}