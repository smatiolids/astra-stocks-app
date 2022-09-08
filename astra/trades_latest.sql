CREATE TABLE demo.trades_latest (
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
    PRIMARY KEY( (RptDt), TckrSymb)
) 