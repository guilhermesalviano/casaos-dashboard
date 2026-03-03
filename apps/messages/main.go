package main

import (
	"encoding/json"
	"fmt"
	"net/http"
)

type Task struct {
	ID      int    `json:"id"`
	Channel string `json:"channel"`
	Text 		string `json:"text"`
}

var queue = make(chan Task, 100)

func worker() {
	for task := range queue {
		fmt.Printf("Processando tarefa %d: %s - %s\n", task.ID, task.Channel, task.Text)
	}
}

func main() {
	go worker()

	http.HandleFunc("/queue", func(w http.ResponseWriter, r *http.Request) {
		var t Task
		json.NewDecoder(r.Body).Decode(&t)

		select {
		case queue <- t:
			w.WriteHeader(http.StatusAccepted)
		default:
			w.WriteHeader(http.StatusServiceUnavailable)
		}
	})

	fmt.Println("Servidor Go rodando na porta 8080...")
	http.ListenAndServe(":8080", nil)
}