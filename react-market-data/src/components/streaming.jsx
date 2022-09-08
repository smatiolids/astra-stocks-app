import StreamingList from './streamingList';

const StreamingTrades = (props) => {
  return (
    <div>
      <h3>Trades</h3>
      <div>{process.env.REACT_APP_SOCKET_URL}</div>
        <StreamingList symbol="PETR4" />
    </div>
  );
};

export default StreamingTrades;
