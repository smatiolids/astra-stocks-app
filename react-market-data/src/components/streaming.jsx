import StreamingChart from './streamingChart';

const StreamingTrades = (props) => {
  return (
    <div>
      <h3>Trades</h3>
      <div>{process.env.REACT_APP_SOCKET_URL}</div>
        <StreamingChart symbol="GGBR4F" />
    </div>
  );
};

export default StreamingTrades;
