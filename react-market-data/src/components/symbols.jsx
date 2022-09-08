import { useEffect, useState, useMemo } from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useForm } from 'react-hook-form';
import ReactJson from 'react-json-view';
import { LinearProgress } from '@mui/material';

const columns = [
  { field: 'tckrsymb', headerName: 'Símbolo', width: 100 },
  {
    field: 'crpnnm',
    headerName: 'Nome',
    width: 500,
  },
  {
    field: 'corpgovnlvlnm',
    headerName: 'Mercado',
    flex: 1,
  },
  {
    field: 'updatedat',
    headerName: 'Versão',
    flex: 1,
  },
];

const APP_URL = `https://${process.env.REACT_APP_ASTRA_DB_ID}-${process.env.REACT_APP_ASTRA_DB_REGION}.apps.astra.datastax.com/api/rest/v2/keyspaces/${process.env.REACT_APP_ASTRA_DB_KEYSPACE}`;

const Symbols = function (props) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState();
  const [symbol, setSymbol] = useState();
  const [symbolHist, setSymbolHist] = useState();
  const { register, handleSubmit } = useForm();
  const {
    register: registerEdit,
    reset: resetEdit,
    handleSubmit: handleSubmitEdit,
  } = useForm();

  const getData = async (symbol) => {
    setLoading(true);
    setMessage();
    const requestOptions = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-cassandra-token': process.env.REACT_APP_ASTRA_DB_APPLICATION_TOKEN,
      },
    };

    const response = await fetch(
      `${APP_URL}/symbols/${symbol}`,
      requestOptions
    ).then((response) => response.json());

    if (!response.data[0]) {
      setMessage(`Símbolo não encontrado`);
      setLoading(false);
      return;
    }

    setSymbol(response);

    if (response && response.data && response.data.length === 1)
      resetEdit({
        tckrsymb: response.data[0].tckrsymb,
        crpnnm: response.data[0].crpnnm,
      });
    const responseHist = await fetch(
      `${APP_URL}/symbols_hist/${symbol}?page-size=5`,
      requestOptions
    ).then((response) => response.json());

    setSymbolHist(responseHist);
    setLoading(false);
  };

  const onSubmit = (data) => getData(data.search);

  const onSubmitEdit = async (data) => {
    setLoading(true);
    const requestOptions = {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-cassandra-token': process.env.REACT_APP_ASTRA_DB_APPLICATION_TOKEN,
      },
      body: JSON.stringify({ crpnnm: data.crpnnm }),
    };

    const response = await fetch(
      `${APP_URL}/symbols/${data.tckrsymb}`,
      requestOptions
    ).then((response) => response.json());

    console.log(response);
    getData(data.tckrsymb);
    setLoading(false);
  };

  return (
    <div>
      {!symbol && (
        <div>
          <h5>Pesquisa</h5>
          <form key={1} onSubmit={handleSubmit(onSubmit)}>
            <input {...register('search')} />
            <input type="submit" value="Pesquisar" />
          </form>
          <div> Informe um símbolo para ver os dados </div>
        </div>
      )}
      {message && <h3> {message}</h3>}
      {loading && <LinearProgress />}

      {symbol && (
        <div>
          <h5>Edição</h5>
          <form
            key={2}
            onSubmit={handleSubmitEdit(onSubmitEdit)}
            style={{ display: 'flex', flexDirection: 'column' }}
          >
            <div>
              <label for="tckrsymb">Símbolo</label>
              <input
                readOnly
                {...registerEdit('tckrsymb')}
                style={{ width: '100px' }}
              />
            </div>
            <div>
              <label for="crpnnm">Nome</label>
              <input {...registerEdit('crpnnm')} style={{ width: '400px' }} />
            </div>
            <div>
              <input type="submit" style={{ width: '200px' }} value="Salvar" />
            </div>
          </form>
        </div>
      )}

      {symbol && symbolHist && symbolHist.data && (
        <div>
          <h5>Versões históricas</h5>

          <div
            style={{
              margin: 100,
              marginTop: 0,
              padding: 20,
              height: 500,
              backgroundColor: 'white',
            }}
          >
            <DataGrid
              rows={symbolHist.data.map((e) => {
                return { id: e.updatedat, ...e };
              })}
              columns={columns}
              pageSize={50}
              rowsPerPageOptions={[50, 100]}
            />
          </div>
        </div>
      )}

      {symbol && (
        <div>
          <input
            type="button"
            style={{
              width: '200px',
              backgroundColor: 'silver',
              color: 'black',
            }}
            value="Atualizar dados"
            onClick={() => getData(symbol.data[0].tckrsymb)}
          />
          <input
            type="button"
            style={{
              width: '200px',
              backgroundColor: 'silver',
              color: 'black',
            }}
            value="Voltar"
            onClick={() => setSymbol()}
          />
        </div>
      )}

      {symbol && (
        <div>
          <h5>Resposta (Símbolos)</h5>

          <div
            style={{
              margin: 100,
              marginTop: 0,
              padding: 20,
              backgroundColor: 'white',
              textAlign: 'left',
            }}
          >
            <ReactJson src={symbol} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Symbols;
