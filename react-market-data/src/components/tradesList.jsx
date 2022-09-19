import { gql, useQuery } from '@apollo/client';
import { DataGrid } from '@mui/x-data-grid';

const GET_TRADES = gql`
  query getLastTrades {
    trades(filter: { symbol: { eq: "PETR4" } }, options: { pageSize: 15 }) {
      values {
        symbol
        day
        amount
        qty
        seq
        timestamp
      }
    }
  }
`;

const columns = [
  { field: 'symbol', headerName: 'Symbol' },
  {
    field: 'timestamp',
    headerName: 'Timestamp',
    width: 250,
  },
  {
    field: 'id',
    headerName: 'Seq',
  },
  {
    field: 'amount',
    headerName: 'Amount',
  },
  {
    field: 'qty',
    headerName: 'Qty',
  },
];

const TradesList = function (props) {
  const { loading, error, data } = useQuery(GET_TRADES, {
    pollInterval: 1000,
    fetchPolicy: 'network-only',
  });

  if (loading) return 'Loading...';
  if (error) return `Error! ${error.message}`;
  console.log(data);

  return (
    <div>
      {loading && <div>Loading data</div>}
      {error && <div>Error: {error}</div>}
      {/* {data &&
        data.data &&
        data.data.data &&
        data.data.data.values && (
          <div style={{ maxWidth: '100%' }}>
            {JSON.stringify(data.data.data.values)}
          </div>
        )} */}
      {data && data.trades && (
        <div style={{ height: 700, backgroundColor: 'white' }}>
          <DataGrid
            rows={data.trades.values.map((e) => {
              return { id: e.seq, ...e };
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

export default TradesList;
