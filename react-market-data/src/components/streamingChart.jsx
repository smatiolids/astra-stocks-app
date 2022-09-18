import React, { useState, useCallback, useEffect } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import differenceInMilliseconds from 'date-fns/differenceInMilliseconds';
import { Buffer } from 'buffer';

import { ResponsiveLine } from '@nivo/line';
import { set } from 'date-fns';

const StreamingChart = (props) => {
  const { symbol } = props;
  const conn = `${process.env.REACT_APP_SOCKET_URL}/reader/persistent/${process.env.REACT_APP_TENANT}/${process.env.REACT_APP_NAMESPACE}/${process.env.REACT_APP_TOPIC}?token=${process.env.REACT_APP_SOCKET_TOKEN}&messageId=latest`;
  const { lastMessage, readyState } = useWebSocket(conn);
  const [data, setData] = useState([
    {
      id: symbol,
      data: [],
    },
  ]);

  useEffect(() => {
    if (lastMessage !== null) {
      const message = JSON.parse(lastMessage.data);
      message.payload = JSON.parse(
        Buffer.from(message.payload, 'base64').toString()
      );
      message.payload.id = message.payload.TradeId;
      message.id = message.payload.TradeId;

      if (message.payload.id && message.payload.TckrSymb === symbol)
        setData((data) => [
          {
            id: symbol,
            data: [
              ...data[0].data,
              { x: message.payload.TS, y: message.payload.GrssTradAmt },
            ],
          },
        ]);
    }
  }, [symbol, lastMessage, setData]);

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
      <span>
        WebSocket status: {connectionStatus} {symbol}
      </span>
      <div className="w-3/4 h-80">
        <StockLine
          data={[
            {
              id: 'teste',
              data: [
                { x: '2022-09-17T10:03:29.133-03:00', y: 2 },
                { x: '2022-09-17T10:03:01.09-03:00', y: 4 },
              ],
            },
          ]}
        />
      </div>
      {/* { data[0].data.length > 0 &&
        <div className="w-3/4 h-80">
          <StockLine data={data} />
        </div>
      } */}
      <ul>
        {data[0].data &&
          data[0].data.reverse().map((message, idx) => (
            <div key={idx}>
              {message.x} | {message.y}
            </div>
          ))}
      </ul>
    </div>
  );
};

const StockLine = ({ data }) => {
  return (
    <ResponsiveLine
      data={data}
      margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
      xScale={{
        type: 'time',
        format: '%Y-%m-%dT%H:%M:%S.%L-%c',
        useUTC: true,
        precision: 'millisecond',
      }}
      xFormat="time:%Y-%m-%d %H:%M:%S.%L"
      yScale={{
        type: 'linear',
        stacked: false,
      }}
      axisLeft={{
        legend: 'linear scale',
        legendOffset: 12,
      }}
      axisBottom={{
        format: '.%L',
        tickValues: 'every 10 milliseconds',
        legend: 'time scale',
        legendOffset: -12,
      }}
      axisTop={null}
      axisRight={null}
      pointSize={10}
      pointColor={{ theme: 'background' }}
      pointBorderWidth={2}
      pointBorderColor={{ from: 'serieColor' }}
      pointLabelYOffset={-12}
      useMesh={true}
      legends={[
        {
          anchor: 'bottom-right',
          direction: 'column',
          justify: false,
          translateX: 100,
          translateY: 0,
          itemsSpacing: 0,
          itemDirection: 'left-to-right',
          itemWidth: 80,
          itemHeight: 20,
          itemOpacity: 0.75,
          symbolSize: 12,
          symbolShape: 'circle',
          symbolBorderColor: 'rgba(0, 0, 0, .5)',
          effects: [
            {
              on: 'hover',
              style: {
                itemBackground: 'rgba(0, 0, 0, .03)',
                itemOpacity: 1,
              },
            },
          ],
        },
      ]}
    />
  );
};

export default StreamingChart;
