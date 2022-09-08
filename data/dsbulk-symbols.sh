#!/bin/bash
CLIENT_ID=""
CLIENT_SECRET=""
BUNDLE=""
KEYSPACE="demo"
TABLE="symbols"
FILE="./symbols.csv"

dsbulk load  -k $KEYSPACE -t $TABLE  -url $FILE -b $BUNDLE -u $CLIENT_ID -p $CLIENT_SECRET \
  -delim ";" \
  -m '1=tckrsymb,2=asst,3=asstdesc,4=sgmtnm,5=mktnm,6=sctyctgynm,9=tradgstartdt,10=tradgenddt,15=isin,16=cficd,22=allcnrndlot,23=tradgccy,40=dstrbtnid,41=pricfctr,42=daystosttlm,46=spcfctncd,47=crpnnm,48=corpactnstartdt,49=ctdytrtmnttpnm,50=mktcptlstn,51=corpgovnlvlnm' \
  --schema.allowMissingFields true
