import React, { useState, useEffect } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { Buffer } from 'buffer';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import {
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Typography,
} from '@mui/material';
import CodeIcon from '@mui/icons-material/Code';


const StreamingLastTrade = (props) => {
  const conn = `${process.env.REACT_APP_SOCKET_URL}/reader/persistent/${process.env.REACT_APP_TENANT}/${process.env.REACT_APP_NAMESPACE}/${process.env.REACT_APP_TOPIC}?token=${process.env.REACT_APP_SOCKET_TOKEN}&messageId=latest`;
  const { lastMessage, readyState } = useWebSocket(conn);
  const [data, setData] = useState({});
  const [showCode, setShowCode] = useState(false);

  useEffect(() => {
    if (lastMessage !== null) {
      const message = JSON.parse(lastMessage.data);
      message.payload = JSON.parse(
        Buffer.from(message.payload, 'base64').toString()
      );

      setData((data) => ({
        ...data,
        [message.payload.TckrSymb]: {
          GrssTradAmt: message.payload.GrssTradAmt,
          TS: message.payload.TS,
        },
      }));
    }
  }, [lastMessage, setData]);

  const connectionStatus =
    {
      [ReadyState.CONNECTING]: 'Connecting',
      [ReadyState.OPEN]: 'Open',
      [ReadyState.CLOSING]: 'Closing',
      [ReadyState.CLOSED]: 'Closed',
      [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
    }[readyState] || readyState;

  return (
    <div className="w-100 m-10 justify-items-center">
      <Card>
        <CardHeader
          title={`Tempo Real`}
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
          {!showCode ? (
            <TableContainer component={Paper}>
              <Table
                sx={{ minWidth: 650 }}
                size="small"
                aria-label="a dense table"
              >
                <TableHead>
                  <TableRow>
                    <TableCell>Símbolo</TableCell>
                    <TableCell align="right">Última</TableCell>
                    <TableCell align="right">Data/Hora</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.keys(data).map((k) => (
                    <TableRow
                      key={`k-${k}`}
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                      <TableCell component="th" scope="row">
                        {k}
                      </TableCell>
                      <TableCell align="right">{data[k].GrssTradAmt}</TableCell>
                      <TableCell align="right">{data[k].TS}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
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
              <Typography variant="h4">Streaming WebSocket</Typography>
              <Typography variant="body1">
                Este componente recebe todos os negócios que estão no tópico de
                negociação através de uma conexão via WebSocket.
              </Typography>
              <Typography variant="body1">
                WebSocket URL: {conn}
              </Typography>
            </div>
          )}
        </CardContent>
      </Card>
      <span>WebSocket status: {connectionStatus}</span>
    </div>
  );
};

export default StreamingLastTrade;
