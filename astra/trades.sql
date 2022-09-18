CREATE TABLE stockapp.trades (
    TradeId TEXT,
    RptDt TEXT,
    TS TIMESTAMP,
    TckrSymb  TEXT,
    UpdActn TEXT,
    GrssTradAmt FLOAT,
    TradQty INT,
    NtryTm  TEXT,
    TradId TEXT,
    TradgSsnId TEXT,
    TradDt TEXT,
    PRIMARY KEY( (RptDt,TckrSymb), TS, TradId)
) WITH CLUSTERING ORDER BY  (TS DESC, TradId DESC);