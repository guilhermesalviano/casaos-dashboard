import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity("todo_checks")
export class TodoCheck {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  timestamp!: string;

  @Column({ type: "tinyint", width: 1, default: 0 })
  checked!: number;
}