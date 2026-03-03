package services

import (
	"fmt"
	"net/http"
	"os"
	"log"
	"strings"

	"github.com/joho/godotenv"
)

func CallMeBotAPI(text string) {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error in loading .env file")
	}

	callMeBotAPIKey := os.Getenv("CALLMEBOT_API_KEY")
	callMeBotWhatsAppNumbers := os.Getenv("CALLMEBOT_WHATSAPP_NUMBER")


	fmt.Printf("CALLMEBOT_WHATSAPP_NUMBER: %s\n", callMeBotWhatsAppNumbers)
	if callMeBotAPIKey == "" || callMeBotWhatsAppNumbers == "" {
		fmt.Println("CALLMEBOT_API_KEY or CALLMEBOT_WHATSAPP_NUMBER is not configured. Ignoring message sending.")
		return
	}

	textReplaced := strings.ReplaceAll(text, " ", "+")
	
	url := fmt.Sprintf("https://api.callmebot.com/whatsapp.php?phone=%s&text=%s&apikey=%s",
		callMeBotWhatsAppNumbers, textReplaced, callMeBotAPIKey)

	fmt.Printf("Sending message to CallMeBot API: %s\n", url)
	resp, err := http.Get(url)
	if err != nil {
		fmt.Printf("Error sending message to CallMeBot API: %v\n", err)
		return
	}
	fmt.Printf("Response from CallMeBot API: %v\n", resp.Status)
}