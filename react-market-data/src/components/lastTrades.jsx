import { gql, useQuery, useLazyQuery } from '@apollo/client';
import { useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { sortBy } from 'lodash';
import { format } from 'date-fns';
import {
  Card,
  CardContent,
  CardHeader,
  FormControl,
  IconButton,
  MenuItem,
  Select,
} from '@mui/material';
import CodeIcon from '@mui/icons-material/Code';

const GET_TRADES = gql`
  query getLastQuotes($dt: String, $symbol: String) {
    trades(
      options: { pageSize: 20 }
      filter: { rptdt: { eq: $dt }, tckrsymb: { eq: $symbol } }
    ) {
      values {
        tckrsymb
        rptdt
        ts
        grsstradamt
        tradqty
        tradid
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
  {
    field: 'tckrsymb',
    headerName: 'Símbolo',
    width: 300,
  },
  {
    field: 'ts',
    headerName: 'Date',
    width: 300,
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
    field: 'tradid',
    headerName: 'ID.',
  },
];

const LastTrades = function (props) {
  const { loading, error, data } = useQuery(GET_SYMBOLS);
  const [tckrsymb, setSymbol] = useState('PETR4');
  const [showCode, setShowCode] = useState(false);
  const [geQuotes, quotes] = useLazyQuery(GET_TRADES, {
    variables: { dt: format(new Date(), 'yyyyMMdd'), symbol: tckrsymb },
  });

  const onSymbolSelected = (event) => {
    setSymbol(event.target.value);
  };

  console.log(tckrsymb);

  if (loading) return 'Loading...';
  if (error) return `Error! ${error.message}`;

  return (
    <div className="w-100 m-10 justify-items-center">
      <Card>
        <CardHeader
          title={`Negociações`}
          action={
            <>
              <IconButton
                aria-label="show-code"
                onClick={() => setShowCode(!showCode)}
              >
                <CodeIcon />
              </IconButton>
            </>
          }
        />
        <CardContent>
          <div>
            <div>
              <FormControl>
                <Select value={tckrsymb} onChange={onSymbolSelected}>
                  {sortBy(data.symbols.values, 'tckrsymb').map((e) => (
                    <MenuItem key={e.tckrsymb} value={e.tckrsymb}>
                      {`${e.tckrsymb}: ${e.crpnnm}`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <input
                type="button"
                value="Ver Últimos Negócios"
                onClick={() =>
                  geQuotes({
                    variables: {
                      dt: format(new Date(), 'yyyyMMdd'),
                      symbol: tckrsymb,
                    },
                  })
                }
              />
            </div>
            {quotes && quotes.loading && <div>Loading quotes</div>}
            {quotes && quotes.error && <div>Erro: {quotes.error}</div>}
            {quotes &&
              quotes.data &&
              quotes.data.trades &&
              quotes.data.trades.values && (
                <div
                  style={{
                    height: 500,
                    width: '100%',
                    backgroundColor: 'white',
                  }}
                >
                  <DataGrid
                    rows={quotes.data.trades.values.map((e) => {
                      return { id: e.tradid, ...e };
                    })}
                    columns={columns}
                    pageSize={50}
                    rowsPerPageOptions={[50, 100]}
                  />
                </div>
              )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LastTrades;
