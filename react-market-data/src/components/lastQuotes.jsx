import { gql, useLazyQuery } from '@apollo/client';
import { useState } from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { LinearProgress } from '@mui/material';

const GET_QUOTES = gql`
  query getQuotes($rptdt: String) {
    trades_latest(filter: { rptdt: { eq: $rptdt } }) {
      values {
        tckrsymb
        grsstradamt
        ts
      }
    }
  }
`;

const columns: GridColDef[] = [
  { field: 'tckrsymb', headerName: 'Symbol' , width:200},
  {
    field: 'grsstradamt',
    headerName: 'Cotação',
    width:200
  },
  {
    field: 'ts',
    headerName: 'Horário',
    width:400
  },
];

const LastQuotes = function (props) {
  const [rptdt, setDate] = useState();
  const [getQuotes, { loading, error, data }] = useLazyQuery(GET_QUOTES,  {
    variables: { rptdt },
    notifyOnNetworkStatusChange: true,
    fetchPolicy: 'no-cache',
    pollInterval: 2000
  });

  const onDateSelected = (event) => {
    setDate(event.target.value);
  };

  return (
    <div>
      <div>
        <span>Data:</span>
        <input onChange={onDateSelected} style={{ width: '100px' }} />

        <input type="button"
          value="Ver cotações"
          onClick={() => getQuotes({ variables: { rptdt: rptdt.toString() } })}
        />
        
      </div>
      {loading && <div><LinearProgress/></div>}
      {error && <div>Erro: {error}</div>}
      {data &&
        data.trades_latest &&
        data.trades_latest.values && (
          <div style={{ height: 500, width: '100%', backgroundColor: 'white' }}>
            <DataGrid
              rows={data.trades_latest.values.map((e) => {
                return { id: e.tckrsymb, ...e };
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

export default LastQuotes;
