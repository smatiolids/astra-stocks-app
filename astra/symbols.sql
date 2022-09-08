CREATE TABLE demo.symbols (
    TckrSymb TEXT PRIMARY KEY,
    Asst TEXT,
    AsstDesc TEXT,
    SgmtNm TEXT,
    MktNm TEXT,
    SctyCtgyNm TEXT,
    TradgStartDt Date,
    TradgEndDt Date,
    ISIN TEXT,
    CFICd TEXT,
    AllcnRndLot INT,
    TradgCcy TEXT,
    DstrbtnId INT,
    PricFctr INT,
    DaysToSttlm INT,
    SpcfctnCd TEXT,
    CrpnNm TEXT,
    CorpActnStartDt TEXT,
    CtdyTrtmntTpNm TEXT,
    MktCptlstn TEXT,
    CorpGovnLvlNm TEXT,
)