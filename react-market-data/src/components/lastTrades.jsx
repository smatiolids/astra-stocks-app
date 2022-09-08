import { gql, useQuery, useLazyQuery } from '@apollo/client';
import { useState } from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { sortBy } from 'lodash';

const GET_TRADES = gql`
  query getLastQuotes($tckrsymb: String) {
    trades(filter: { rptdt: { eq: "20220603" }, tckrsymb: { eq: $tckrsymb } }, options: { pageSize: 20 }) {
      values {
        tckrsymb
        rptdt
        ts
        grsstradamt
        tradqty
        tradeid
      }
    }
  }
`;
const GET_SYMBOLS = gql`
  query GetSymbols {
    symbols(options: { pageSize: 2000 }) {
      values {
        tckrsymb
        crpnnm
      }
    }
  }
`;

const columns = [
  { field: 'tckrsymb', headerName: 'Symbol' },
  {
    field: 'ts',
    headerName: 'Date',
    width: 300
  },
  {
    field: 'grsstradamt',
    headerName: 'Preço',
  },
  {
    field: 'tradqty',
    headerName: 'Qtde.',
  },
  {
    field: 'tradeid',
    headerName: 'ID.',
  },
];

const LastTrades = function (props) {
  const { loading, error, data } = useQuery(GET_SYMBOLS);
  const [tckrsymb, setSymbol] = useState('PETR4');
  const [geQuotes, quotes] = useLazyQuery(GET_TRADES, {variables: { tckrsymb }});

  const onSymbolSelected = (event) => {
    setSymbol(event.target.value);
  };

  console.log(quotes);

  if (loading) return 'Loading...';
  if (error) return `Error! ${error.message}`;

  return (
    <div>
      <div>

        <select value={tckrsymb} onChange={onSymbolSelected}>
          { sortBy(data.symbols.values,'tckrsymb').map((e) => (
            <option key={e.tckrsymb} value={e.tckrsymb}>
              {`${e.tckrsymb}: ${e.crpnnm}`}
            </option>
          ))}
        </select>
        <input type="button"
          value="Ver Últimos Negócios"
          onClick={() => geQuotes({ variables: { tckrsymb } })}
        />
      </div>
      {quotes && quotes.loading && <div>Loading quotes</div>}
      {quotes && quotes.error && <div>Erro: {quotes.error}</div>}
      {quotes &&
        quotes.data &&
        quotes.data.trades &&
        quotes.data.trades.values && (
          <div style={{ height: 500, width: '100%', backgroundColor: 'white' }}>
            <DataGrid
              rows={quotes.data.trades.values.map((e) => {
                return { id: e.tradeid, ...e };
              })}
              columns={columns}
              pageSize={50}
              rowsPerPageOptions={[50, 100]}
            />
          </div>
        )}
    </div>
  );
};

export default LastTrades;
