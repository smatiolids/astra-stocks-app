import React, { useState, useCallback, useEffect } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import differenceInMilliseconds from 'date-fns/differenceInMilliseconds';
import {Buffer} from 'buffer';
import { DataGrid } from '@mui/x-data-grid';
const columns: GridColDef[] = [
  { field: 'TckrSymb', headerName: 'Símbolo', width: 100 },
  {
    field: 'GrssTradAmt',
    headerName: 'Preço',
    width: 100,
  },
  {
    field: 'TradQty',
    headerName: 'Qtde',
    width: 100,
  },
  {
    field: 'TS',
    headerName: 'Horário',
    type: 'dateTime',
    flex: 1,
  },
];

const StreamingList = ({ symbol }) => {
  const [messageHistory, setMessageHistory] = useState([]);
  const conn = `${process.env.REACT_APP_SOCKET_URL}/reader/persistent/${process.env.REACT_APP_TENANT}/${process.env.REACT_APP_NAMESPACE}/${process.env.REACT_APP_TOPIC}?token=${process.env.REACT_APP_SOCKET_TOKEN}&messageId=latest`;
  const { lastMessage, readyState } = useWebSocket(conn);

  useEffect(() => {
    if (lastMessage !== null) {
      setMessageHistory((prev) => {
        if (prev.length > 10) prev.shift();

        const message = JSON.parse(lastMessage.data);
        message.recDate = new Date();
        message.milliSeconds = differenceInMilliseconds(
          new Date(),
          new Date(message.publishTime)
        );
        message.payload = JSON.parse(Buffer.from(message.payload, 'base64').toString())
        message.payload.id = message.payload.TradeId
        message.id = message.payload.TradeId
        prev.push(message);
        return prev;
      });
    }
  }, [lastMessage, setMessageHistory]);

  const connectionStatus =
    {
      [ReadyState.CONNECTING]: 'Connecting',
      [ReadyState.OPEN]: 'Open',
      [ReadyState.CLOSING]: 'Closing',
      [ReadyState.CLOSED]: 'Closed',
      [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
    }[readyState] || readyState;

  return (
    <div>
      <span>WebSocket status: {connectionStatus}</span>
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
              rows={messageHistory.reverse().map((e) => {
                return { id: e.TradeId, ...e.payload };
              })}
              columns={columns}
              pageSize={50}
              rowsPerPageOptions={[50, 100]}
            />
          </div>
        </div>

      <div>
        {lastMessage ? (
          <div>
            <div>{`Last Messsage: ${lastMessage.data}`}</div>
            <div>{`payload: ${lastMessage.data.payload}`}</div>
            {/* <div>{`payload: ${Buffer.from(lastMessage.data.payload, 'base64').toString()}`}</div> */}
          </div>
        ) : null}
      </div>
      <ul>
        {messageHistory
          .slice(0)
          .reverse()
          .map((message, idx) => (
            <div key={idx}>
              {message
                ? `${message.messageId} : ${JSON.stringify(message.payload)} ${message.milliSeconds}ms (Latency) `
                : null}
            </div>
          ))}
      </ul>
    </div>
  );
};

export default StreamingList;
