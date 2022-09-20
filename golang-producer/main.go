package main

import (
	"bufio"
	"context"
	"io"
	"log"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/apache/pulsar-client-go/pulsar"
)

var gStreamingURI = "pulsar+ssl://pulsar-gcp-useast1.streaming.datastax.com:6651"
var gTopicName = "persistent://rmd-astrademo-stream/default/topic-trades"
var gAstraTokenStrToPublishToTopic = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE2NjM2MzcwNDcsImlzcyI6ImRhdGFzdGF4Iiwic3ViIjoiY2xpZW50O2IyOTFjOTZkLWExNmQtNDBhMy05MjcwLTIwNGNjNjlhYTQ1ZDtjbTFrTFdGemRISmhaR1Z0YnkxemRISmxZVzA9OzJiZmJmNjhmNjUiLCJ0b2tlbmlkIjoiMmJmYmY2OGY2NSJ9.cu3Oqrwve5wW6uyku1BaWOpVlbQF24wK-5t6QUAY4PnqUn5IPeEz81Sg9MCnGrd6xYPIdo4TpROXHh7H3_Wr5uQHDW6ibtNPy-ANLJ0gy5LDBRUFFNeMLlrU1wrNNo4StI2NEwph9YbGjhE695cD3zyLxH8COsVAoqx9fQeXB1C3kI8IjdtFV9itrb-LmU8l45qqwQENqZ9A6WZhBSOoLHdUcG6mR09tGMsyuGMg81HQWGQg0cKrFhWySOZ0w6HpzuRdyFw2Vu-hl50KwHQXWeyHMJd9EV0xHqduSi8R0RaOK6keITzehBPgRwfFvh9Uz-I-_tDaCwZJzFuEW8yL8g"

type tradeType struct {
	TradeId     string    `json:"TradeId"`
	RptDt       string    `json:"RptDt"`
	TS          time.Time `json:"TS"`
	TckrSymb    string    `json:"TckrSymb"`
	UpdActn     string    `json:"UpdActn"`
	GrssTradAmt float32   `json:"GrssTradAmt"`
	TradQty     int       `json:"TradQty"`
	NtryTm      string    `json:"NtryTm"`
	TradId      string    `json:"TradId"`
	TradgSsnId  string    `json:"TradgSsnId"`
	TradDt      string    `json:"TradDt"`
}

var (
	// Estrutura de dados para envio ao Astra Streaming
	tradeSchemaDef = "{\"type\":\"record\",\"name\":\"Trade\",\"namespace\":\"demo\"," +
		"\"fields\":[" +
		"{\"name\":\"TS\",\"type\":\"string\"}," +
		"{\"name\":\"TradeId\",\"type\":\"string\"}," +
		"{\"name\":\"RptDt\",\"type\":\"int\"}," +
		"{\"name\":\"TckrSymb\",\"type\":\"string\"}," +
		"{\"name\":\"UpdActn\",\"type\":\"string\"}," +
		"{\"name\":\"GrssTradAmt\",\"type\":\"float\"}," +
		"{\"name\":\"TradQty\",\"type\":\"int\"}," +
		"{\"name\":\"NtryTm\",\"type\":\"string\"}," +
		"{\"name\":\"TradId\",\"type\":\"string\"}," +
		"{\"name\":\"TradgSsnId\",\"type\":\"string\"}," +
		"{\"name\":\"TradDt\",\"type\":\"string\"}" +
		"]}"
)

func main() {
	log.Println("[Astra Streaming] Starting Pulsar Producer")

	// Configuração para conexão com Astra Streaming

	// Busque o "Broker Service URL" na aba "Connect"
	uri := gStreamingURI

	// Busque na aba "Topics" o "Full Name" do tópico "topic-trades"
	topicName := gTopicName

	// Gere um token na aba "Settings"
	tokenStr := gAstraTokenStrToPublishToTopic

	token := pulsar.NewAuthenticationToken(tokenStr)

	client, err := pulsar.NewClient(pulsar.ClientOptions{
		URL:            uri,
		Authentication: token,
	})

	if err != nil {
		log.Fatalf("[Astra Streaming] Could not instantiate Pulsar client: %v", err)
	}

	defer client.Close()

	log.Printf("[Astra Streaming] Creating producer...")
	producerJS := pulsar.NewJSONSchema(tradeSchemaDef, nil)
	// Use the client to instantiate a producer
	producer, err := client.CreateProducer(pulsar.ProducerOptions{
		Topic:  topicName,
		Schema: producerJS,
	})

	log.Printf("[Astra Streaming] Checking error of producer creation...")
	if err != nil {
		log.Fatal(err)
	}

	defer producer.Close()
	log.Printf("[Astra Streaming] Opening file... %s", os.Args[1])

	file, err := os.Open(os.Args[1])
	if err != nil {
		panic(err)
	}
	defer file.Close()
	today := time.Now().Format("2006-01-02")

	reader := bufio.NewReader(file)
	ctx := context.Background()
	for {
		line, _, err := reader.ReadLine()

		if err == io.EOF {
			break
		}

		s := strings.Split(string(line), ";")

		GrssTradAmt, err := strconv.ParseFloat(strings.ReplaceAll(s[3], ",", "."), 32)
		TradQty, err := strconv.ParseInt(s[4], 10, 32)
		TS, err := time.Parse("2006-01-02 150405.000 -07", today+" "+s[5][:6]+"."+s[5][6:]+" -03")

		msg := pulsar.ProducerMessage{
			Value: &tradeType{
				TradeId:     strings.ReplaceAll(today, "-", "") + s[5] + s[6],
				RptDt:       strings.ReplaceAll(today, "-", ""),
				TS:          TS,
				TckrSymb:    s[1],
				UpdActn:     s[2],
				GrssTradAmt: float32(GrssTradAmt),
				TradQty:     int(TradQty),
				NtryTm:      s[5],
				TradId:      s[6],
				TradgSsnId:  s[7],
				TradDt:      s[8],
			},
		}

		_, err = producer.Send(ctx, &msg)
		if err != nil {
			log.Fatal(err)
		}
		log.Printf("[Astra Streaming] Published message: %s", line)
	}
}
