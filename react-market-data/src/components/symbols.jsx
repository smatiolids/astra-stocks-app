import {  useState,  } from 'react';
import { useForm } from 'react-hook-form';
import ReactJson from 'react-json-view';
import {
  Card,
  CardContent,
  CardHeader,
  IconButton,
  LinearProgress,
  Typography,
} from '@mui/material';
import CodeIcon from '@mui/icons-material/Code';
import CancelIcon from '@mui/icons-material/Cancel';

const APP_URL = `https://${process.env.REACT_APP_ASTRA_DB_ID}-${process.env.REACT_APP_ASTRA_DB_REGION}.apps.astra.datastax.com/api/rest/v2/keyspaces/${process.env.REACT_APP_ASTRA_DB_KEYSPACE}`;

const Symbols = function (props) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState();
  const [showCode, setShowCode] = useState(false);
  const [symbol, setSymbol] = useState();
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

    setSymbol(response.data[0]);

    if (response && response.data && response.data.length === 1)
      resetEdit({
        tckrsymb: response.data[0].tckrsymb,
        crpnnm: response.data[0].crpnnm,
      });

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

    await fetch(
      `${APP_URL}/symbols/${data.tckrsymb}`,
      requestOptions
    ).then((response) => response.json());

    getData(data.tckrsymb);
    setLoading(false);
  };

  return (
    <div className="w-100 m-10 justify-items-center">
      {!symbol && (
        <div>
          <Card>
            <CardHeader title="Pesquisa de Símbolo" />
            <CardContent>
              <form key={1} onSubmit={handleSubmit(onSubmit)}>
                <input {...register('search')} />
                <input type="submit" value="Pesquisar" />
              </form>
              {message && <h3> {message}</h3>}
            </CardContent>
          </Card>
        </div>
      )}
      {loading && <LinearProgress />}

      {symbol && (
        <div>
          <Card>
            <CardHeader
              title="Edição do Símbolo"
              action={
                <>
                  <IconButton
                    aria-label="show-code"
                    onClick={() => setShowCode(!showCode)}
                  >
                    <CodeIcon />
                  </IconButton>
                  <IconButton
                    aria-label="show-code"
                    onClick={() => setSymbol()}
                  >
                    <CancelIcon />
                  </IconButton>
                </>
              }
            />
            <CardContent>
              {!showCode ? (
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
                    <input
                      {...registerEdit('crpnnm')}
                      style={{ width: '400px' }}
                    />
                  </div>
                  <div>
                    <input
                      type="submit"
                      style={{ width: '200px' }}
                      value="Salvar"
                    />
                  </div>
                </form>
              ) : (
                <div
                  style={{
                    margin: 100,
                    marginTop: 0,
                    padding: 20,
                    backgroundColor: 'white',
                    textAlign: 'left',
                  }}
                >
                  <Typography variant="h4">
                    Stargate REST Api
                  </Typography>
                  <Typography variant="body1">
                    Esta tela exibe dados consumidos diretamente da API REST automática disponibilizada pelo Astra Stargate.
                  </Typography>
                  <Typography variant="body2">
                    GET: 
                    {`${APP_URL}/symbols/${symbol.tckrsymb}`}
                  </Typography>
                  <ReactJson src={symbol} />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Symbols;
