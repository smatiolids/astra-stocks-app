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
	uri := "pulsar+ssl://pulsar-gcp-useast1.streaming.datastax.com:6651"

	// Busque na aba "Topics" o "Full Name" do tópico "topic-trades"
	topicName := "persistent://astrademo-stream/default/topic-trades"

	// Gere um token na aba "Settings"
	tokenStr := "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE2NjM0NDA1ODksImlzcyI6ImRhdGFzdGF4Iiwic3ViIjoiY2xpZW50O2UxOWI1YTcxLWVhMDUtNDNkZS05ZTFjLWIzODg2NTRhODMyZTtZWE4wY21Ga1pXMXZMWE4wY21WaGJRPT07YTE2YWFmNzBkMyIsInRva2VuaWQiOiJhMTZhYWY3MGQzIn0.aePVWyx3sQgK5YJJWFQ0yg-yBsSoJcIKQM952ta8dHWgcoPJUptYOmDwDCMUUZ-TGBhzNQxbXFT9qXz98ZbgOwF1H4jj_bRLnXgP2aTF8T-Ud7b4QWfmJdPfXbOP6JpChMPHinm0mEQDgsQtJgJwtlYg6oZxNtzr5ggmSd1AINVTHLA-2AnXQAJUPR2tN0y6jXu5306uTin16VYDOpT4gUpJnzffGOhZO0ENUV_PmVqV4wV3lm93Q1gp6YhNKOuhRTwf0zc72CdZUkA_otYunPU-vvVA6lXaCvCtHxIEFbqeBweHftIMZMo10RBdp95Dzg2vIAXgCTmA1EDOkUn5Cw"

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
