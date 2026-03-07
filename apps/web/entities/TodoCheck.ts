import { Entity, Column, JoinColumn, OneToOne, PrimaryColumn } from "typeorm";
import { Todo } from "./Todo";

@Entity("todo_checks")
export class TodoCheck {
  @PrimaryColumn()
  id!: string;

  @PrimaryColumn()
  timestamp!: string;

  @Column({ type: "tinyint", width: 1, default: 0 })
  checked!: number;

  @OneToOne(() => Todo)
  @JoinColumn()
  todo!: Todo;
}