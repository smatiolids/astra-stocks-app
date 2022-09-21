# Astra-Stocks-App
Demo App using Astra focused on stock market

## Pré-requisitos

### Instalando GO

Baixe o instalador para o seu sistema operacional diretamente em: [https://go.dev/doc/install](https://go.dev/doc/install)

### Instalando React

Instale o NodeJs compatível com seu sistema operacional em [https://nodejs.org/en/](https://nodejs.org/en/)
Instale o create-react-app globalmente com:
```
npm install -g create-react-app@latest
```
Mais informações em [https://www.freecodecamp.org/portuguese/news/como-instalar-o-react-js-com-create-react-app/](https://www.freecodecamp.org/portuguese/news/como-instalar-o-react-js-com-create-react-app/)


## Workshop 01


- Create a Astra Account on https://astra.datastax.com
- Create a database on GCP, in us-east1 region. In this step, also create the keyspace named "stockapp"
- Save your auto-generated tokens JSON file.  You will not have access to these later!  For e.g.:
- {
  "clientID": "BvrQyEOCQkbZsuvnDnUbglsg"
  "clientSecret": "jNkABQU.ER.BG6gym6vE-CiC63QIqb+E4,0ZRI2MCo2fz,BmErZ1s3Koz1m+-U9aU8Hh_lOkvLZqoNOUL2FAksvLQJcG2,KSFRXMJZcJpTKCGJZaKpbGUZ0eSJPIHe9w"
  "token": "AstraCS:BvrQyEOCQkbZsuvnDnUbglsg:437ae394c9c760b03eb7084ecf05bc9086dcea6310bb4216aca6c9e782e7c9b5"
  }
- 
- Using the "CQL Console" create the tables available on /astra folder - symbols, trades, 
and trades_latest
- Load data to the symbols table using the load-symbols file

# Streaming

Create an Astra Stream called "yourname-astrademo-stream"; substitute the 'yourname' so as 
to create a unique name.

Create a new topic "topic-trades"

Go to "Connect" to get "Tenant Details" for your topic
GO to "Topic", click on default, and then copy the "full name" of your topic
Go to "Settings" and click on the copy button to copy the value for the primary "Token ID"

Edit main.go to update with your credentials to programmatically access Astra.

# Install go

I elect to NOT change the default macOS go install

mkdir -p $HOME/go/{bin,src,pkg}
download https://go.dev/dl/go1.19.1.darwin-arm64.tar.gz
cd $HOME/go
tar xvfz ~/Downloads/go1.19.1.darwin-amd64.tar.gz

## set vars for shell
#
#  Manually instal go to keep MacOS go pristine
#
export GOPATH="/Users/rajeevdave/go1.19.1/go"
export PATH=$GOPATH/bin:$PATH

go version
<code>
go version go1.19.1 darwin/amd64
</code>

# Now build the package
go build main.go
