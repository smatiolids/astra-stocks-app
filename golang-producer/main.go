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
	//RptDt;TckrSymb;UpdActn;GrssTradAmt;TradQty;NtryTm;TradId;TradgSsnId;TradDt
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
	log.Println("Pulsar Producer")

	// Configuration variables pertaining to this consumer
	tokenStr := "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE2NTA0NzkxMDgsImlzcyI6ImRhdGFzdGF4Iiwic3ViIjoiY2xpZW50OzQxOTQwMjM3LTQ3NmUtNDZiNi05OTcxLTE2MTVmY2IyODA0ODtZMlJqWkdWdGJ5MXpkSEpsWVcxejtlZTRkMTJmOTM4IiwidG9rZW5pZCI6ImVlNGQxMmY5MzgifQ.AEgsd4hIu-1wb7xYlpYlKr-bicxUebjRy9NGH7ZhFz3Y45WRyR8P0A7RTHLe4rV4NwczpT5H_eDM2bBEnZM3oPzxncffWv0cIjM3z2mGwWhGK-P4T9hQJL44Rfw3lknMZrWXzdr4sfkYW8JKtfUb3scL3tcPIgsLKM5pSsinjHRiJg3YV3j63uA2iAUfzGQgZdHL2rhIPiv1QVEzcJ8oQQuZ0pZD69r_yNXPVkzsQ136oj8whZzaTQxdiri5OO108k15MxSFoSu5YNu128nIdxAkNV7m4B5v-dIc_MS3Wi78M9pgLpV5DHWHIr-2N9WNU-eb29JoW7_q1R11NgeZLg"
	uri := "pulsar+ssl://pulsar-gcp-europewest1.streaming.datastax.com:6651"
	topicName := "persistent://cdcdemo-streams/astracdc/b3intraday"

	token := pulsar.NewAuthenticationToken(tokenStr)

	client, err := pulsar.NewClient(pulsar.ClientOptions{
		URL:            uri,
		Authentication: token,
	})

	if err != nil {
		log.Fatalf("Could not instantiate Pulsar client: %v", err)
	}

	defer client.Close()

	log.Printf("creating producer...")
	producerJS := pulsar.NewJSONSchema(tradeSchemaDef, nil)
	// Use the client to instantiate a producer
	producer, err := client.CreateProducer(pulsar.ProducerOptions{
		Topic:  topicName,
		Schema: producerJS,
	})

	log.Printf("checking error of producer creation...")
	if err != nil {
		log.Fatal(err)
	}

	defer producer.Close()
	log.Printf("Opening file... %s", os.Args[1])

	file, err := os.Open(os.Args[1])
	if err != nil {
		panic(err)
	}
	defer file.Close()

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
		TS, err := time.Parse("2006-01-02 150405.000 -07", s[0]+" "+s[5][:6]+"."+s[5][6:]+" -03")

		msg := pulsar.ProducerMessage{
			Value: &tradeType{
				TradeId:     strings.ReplaceAll(s[0], "-", "") + s[5] + s[6],
				RptDt:       strings.ReplaceAll(s[0], "-", ""),
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
		log.Printf("Published message: %s", line)
	}
}
