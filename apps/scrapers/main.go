package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	"sort"
	"strconv"
	"time"
	"github.com/joho/godotenv"
	"log"
)

// ─── Config ──────────────────────────────────────────────────────────────────

const serpAPIBase = "https://serpapi.com/search"

// ─── Request / Response types ────────────────────────────────────────────────

type SearchParams struct {
	APIKey       string
	DepartureID  string // IATA code, e.g. "GRU"
	ArrivalID    string // IATA code, e.g. "JFK"
	OutboundDate string // YYYY-MM-DD
	ReturnDate   string // YYYY-MM-DD (empty = one-way)
	Adults       int
	TravelClass  int // 1=Economy 2=Premium 3=Business 4=First
	Stops        int // 0=Any 1=Nonstop 2=1stop 3=2stops
	Currency     string // e.g. "BRL", "USD"
	Language     string // e.g. "pt", "en"
	Country      string // e.g. "br", "us"
}

type Flight struct {
	Airline       string  `json:"airline"`
	FlightNumber  string  `json:"flight_number"`
	Departure     string  `json:"departure_time"`
	Arrival       string  `json:"arrival_time"`
	Duration      int     `json:"duration_minutes"`
	Stops         int     `json:"stops"`
	Price         float64 `json:"price"`
	Currency      string  `json:"currency"`
	CarbonEmitKg  int     `json:"carbon_emissions_kg,omitempty"`
}

type SearchResult struct {
	SearchedAt  time.Time `json:"searched_at"`
	Origin      string    `json:"origin"`
	Destination string    `json:"destination"`
	Date        string    `json:"outbound_date"`
	ReturnDate  string    `json:"return_date,omitempty"`
	BestFlights []Flight  `json:"best_flights"`
	OtherFlights []Flight `json:"other_flights"`
	BestPrice   float64   `json:"best_price"`
	Currency    string    `json:"currency"`
}

// ─── SerpApi raw response ─────────────────────────────────────────────────────

type serpLayover struct {
	Name     string `json:"name"`
	ID       string `json:"id"`
	Duration int    `json:"duration"`
}

type serpFlight struct {
	Flights []struct {
		DepartureAirport struct{ Time string `json:"time"` } `json:"departure_airport"`
		ArrivalAirport   struct{ Time string `json:"time"` } `json:"arrival_airport"`
		Duration         int    `json:"duration"`
		Airline          string `json:"airline"`
		FlightNumber     string `json:"flight_number"`
	} `json:"flights"`
	Layovers        []serpLayover `json:"layovers"`
	TotalDuration   int `json:"total_duration"`
	CarbonEmissions struct {
		ThisFlightKg int `json:"this_flight"`
	} `json:"carbon_emissions"`
	Price   int    `json:"price"`
	Airline string `json:"airline,omitempty"`
}

type serpResponse struct {
	BestFlights  []serpFlight `json:"best_flights"`
	OtherFlights []serpFlight `json:"other_flights"`
	Error        string       `json:"error,omitempty"`
}

// ─── Crawler ─────────────────────────────────────────────────────────────────

func buildQuery(p SearchParams) url.Values {
	q := url.Values{}
	q.Set("engine", "google_flights")
	q.Set("api_key", p.APIKey)
	q.Set("departure_id", p.DepartureID)
	q.Set("arrival_id", p.ArrivalID)
	q.Set("outbound_date", p.OutboundDate)
	q.Set("adults", strconv.Itoa(p.Adults))
	q.Set("travel_class", strconv.Itoa(p.TravelClass))
	q.Set("stops", strconv.Itoa(p.Stops))
	q.Set("currency", p.Currency)
	q.Set("hl", p.Language)
	q.Set("gl", p.Country)

	if p.ReturnDate != "" {
		q.Set("return_date", p.ReturnDate)
		q.Set("type", "1") // round-trip
	} else {
		q.Set("type", "2") // one-way
	}
	return q
}

func fetchFlights(p SearchParams) (*SearchResult, error) {
	reqURL := fmt.Sprintf("%s?%s", serpAPIBase, buildQuery(p).Encode())

	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Get(reqURL)
	if err != nil {
		return nil, fmt.Errorf("HTTP request failed: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("reading response: %w", err)
	}

	var raw serpResponse
	if err := json.Unmarshal(body, &raw); err != nil {
		return nil, fmt.Errorf("parsing JSON: %w", err)
	}
	if raw.Error != "" {
		return nil, fmt.Errorf("API error: %s", raw.Error)
	}

	result := &SearchResult{
		SearchedAt:  time.Now().UTC(),
		Origin:      p.DepartureID,
		Destination: p.ArrivalID,
		Date:        p.OutboundDate,
		ReturnDate:  p.ReturnDate,
		Currency:    p.Currency,
	}

	parse := func(raw []serpFlight) []Flight {
		var out []Flight
		for _, sf := range raw {
			airline := sf.Airline
			flightNum := ""
			depTime := ""
			arrTime := ""
			if len(sf.Flights) > 0 {
				if airline == "" {
					airline = sf.Flights[0].Airline
				}
				flightNum = sf.Flights[0].FlightNumber
				depTime = sf.Flights[0].DepartureAirport.Time
				arrTime = sf.Flights[len(sf.Flights)-1].ArrivalAirport.Time
			}
			out = append(out, Flight{
				Airline:      airline,
				FlightNumber: flightNum,
				Departure:    depTime,
				Arrival:      arrTime,
				Duration:     sf.TotalDuration,
				Stops:        len(sf.Layovers),
				Price:        float64(sf.Price),
				Currency:     p.Currency,
				CarbonEmitKg: sf.CarbonEmissions.ThisFlightKg,
			})
		}
		return out
	}

	result.BestFlights = parse(raw.BestFlights)
	result.OtherFlights = parse(raw.OtherFlights)

	// Find overall best (lowest) price
	all := append(result.BestFlights, result.OtherFlights...)
	if len(all) > 0 {
		best := all[0].Price
		for _, f := range all[1:] {
			if f.Price > 0 && f.Price < best {
				best = f.Price
			}
		}
		result.BestPrice = best
	}

	return result, nil
}

// ─── Display ─────────────────────────────────────────────────────────────────

func printResults(r *SearchResult) {
	fmt.Printf("\n╔══════════════════════════════════════════════════════╗\n")
	fmt.Printf("║         Google Flights — Best Price Crawler          ║\n")
	fmt.Printf("╚══════════════════════════════════════════════════════╝\n")
	fmt.Printf("  Route     : %s → %s\n", r.Origin, r.Destination)
	fmt.Printf("  Outbound  : %s\n", r.Date)
	if r.ReturnDate != "" {
		fmt.Printf("  Return    : %s\n", r.ReturnDate)
	}
	fmt.Printf("  Searched  : %s\n", r.SearchedAt.Format("2006-01-02 15:04:05 UTC"))
	fmt.Printf("  ★ Best price: %.0f %s\n\n", r.BestPrice, r.Currency)

	printSection := func(label string, flights []Flight) {
		if len(flights) == 0 {
			return
		}
		// Sort by price
		sort.Slice(flights, func(i, j int) bool {
			return flights[i].Price < flights[j].Price
		})
		fmt.Printf("── %s (%d results) ──────────────────────────────\n", label, len(flights))
		fmt.Printf("  %-22s %-8s %-8s %-10s %-6s %s\n",
			"Airline", "Dep", "Arr", "Duration", "Stops", "Price")
		fmt.Printf("  %s\n", "─────────────────────────────────────────────────────────")
		for _, f := range flights {
			dur := fmt.Sprintf("%dh%02dm", f.Duration/60, f.Duration%60)
			stops := "nonstop"
			if f.Stops == 1 {
				stops = "1 stop"
			} else if f.Stops > 1 {
				stops = fmt.Sprintf("%d stops", f.Stops)
			}
			fmt.Printf("  %-22s %-8s %-8s %-10s %-6s %.0f %s\n",
				truncate(f.Airline, 22),
				timeOnly(f.Departure),
				timeOnly(f.Arrival),
				dur, stops,
				f.Price, f.Currency,
			)
		}
		fmt.Println()
	}

	printSection("Best Flights", r.BestFlights)
	printSection("Other Flights", r.OtherFlights)
}

func truncate(s string, n int) string {
	if len(s) <= n {
		return s
	}
	return s[:n-1] + "…"
}

func timeOnly(dt string) string {
	// dt format: "2006-01-02 15:04"
	if len(dt) >= 16 {
		return dt[11:16]
	}
	return dt
}

// ─── Main ─────────────────────────────────────────────────────────────────────

func main() {
	err := godotenv.Load()
	if err != nil { log.Println("Warning: .env file not found, relying on environment variables") }

	apiKey     := flag.String("key", os.Getenv("SERPAPI_KEY"), "SerpApi API key (or set SERPAPI_KEY env var)")
	from       := flag.String("from", "GRU", "Departure IATA code (e.g. GRU, JFK, LHR)")
	to         := flag.String("to", "JFK", "Arrival IATA code (e.g. JFK, GRU, CDG)")
	outbound   := flag.String("date", time.Now().AddDate(0, 1, 0).Format("2006-01-02"), "Outbound date YYYY-MM-DD")
	returnDate := flag.String("return", "", "Return date YYYY-MM-DD (empty = one-way)")
	adults     := flag.Int("adults", 1, "Number of adult passengers")
	class      := flag.Int("class", 1, "Travel class: 1=Economy 2=Premium Economy 3=Business 4=First")
	stops      := flag.Int("stops", 0, "Max stops: 0=Any 1=Nonstop 2=1stop 3=2stops")
	currency   := flag.String("currency", "BRL", "Currency code (e.g. BRL, USD, EUR)")
	lang       := flag.String("lang", "pt", "Language code (e.g. pt, en)")
	country    := flag.String("country", "br", "Country code (e.g. br, us)")
	output     := flag.String("output", "", "Save results to JSON file (optional)")
	flag.Parse()

	if *apiKey == "" {
		fmt.Fprintln(os.Stderr, "❌  API key required. Use -key flag or set SERPAPI_KEY env var.")
		fmt.Fprintln(os.Stderr, "    Get a free key at https://serpapi.com/")
		os.Exit(1)
	}

	params := SearchParams{
		APIKey:       *apiKey,
		DepartureID:  *from,
		ArrivalID:    *to,
		OutboundDate: *outbound,
		ReturnDate:   *returnDate,
		Adults:       *adults,
		TravelClass:  *class,
		Stops:        *stops,
		Currency:     *currency,
		Language:     *lang,
		Country:      *country,
	}

	fmt.Printf("🔍 Searching flights %s → %s on %s...\n", params.DepartureID, params.ArrivalID, params.OutboundDate)

	result, err := fetchFlights(params)
	if err != nil {
		fmt.Fprintf(os.Stderr, "❌  Error: %v\n", err)
		os.Exit(1)
	}

	printResults(result)

	if *output != "" {
		data, _ := json.MarshalIndent(result, "", "  ")
		if err := os.WriteFile(*output, data, 0644); err != nil {
			fmt.Fprintf(os.Stderr, "⚠️  Could not write output file: %v\n", err)
		} else {
			fmt.Printf("💾 Results saved to %s\n", *output)
		}
	}
}