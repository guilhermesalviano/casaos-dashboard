import { Entity, Column, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { Todo } from "./Todo";

@Entity("todo_checks")
export class TodoCheck {
  @PrimaryColumn()
  id!: string;

  @PrimaryColumn()
  timestamp!: string;

  @Column()
  hour!: string;

  @Column({ type: "tinyint", width: 1, default: 0 })
  checked!: number;

  @ManyToOne(() => Todo)
  @JoinColumn()
  todo!: Todo;
}