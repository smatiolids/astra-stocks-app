import React, { useState, useEffect } from 'react';

import { roundToNearestMinutes } from 'date-fns';
import {
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  FormControlLabel,
  IconButton,
  Typography,
} from '@mui/material';
import { print } from 'graphql';
import { gql, useQuery } from '@apollo/client';
import IntradayChartJS2 from './IntradayChartJS2';
import { format } from 'date-fns/esm';
import CodeIcon from '@mui/icons-material/Code';

const GET_TRADES = gql`
  query getTrades($dt: String, $symbol: String) {
    trades(
      options: { pageSize: 1000 }
      filter: { rptdt: { eq: $dt }, tckrsymb: { eq: $symbol } }
    ) {
      values {
        ts
        grsstradamt
        tradqty
      }
    }
  }
`;


const IntradayChart = () => {
  const [variables] = useState({
    symbol: 'GGBR4',
    dt: format(new Date(), 'yyyyMMdd'),
  });
  const [showCode, setShowCode] = useState(false);
  const [dataAggr, setDataAggr] = useState({});
  const [pooling, setPooling] = useState(true);

  const handleChange = (event) => {
    setPooling(event.target.checked);
  };
  const { loading, error, data } = useQuery(GET_TRADES, {
    pollInterval: pooling ? 5000 : 0,
    fetchPolicy: 'network-only',
    variables: variables,
  });

  useEffect(() => {
    if (data && data.trades) {
      setDataAggr(() => {
        return data.trades.values.reverse().reduce((acc, cur) => {
          let min = roundToNearestMinutes(new Date(cur.ts), {
            nearestTo: 1,
            roundToNearestMinutes: 'trunc',
          }).toISOString();
          if (!acc[min])
            acc[min] = {
              tradqty: 0,
              grsstradamt: 0,
            };
          acc[min].tradqty += cur.tradqty;
          acc[min].grsstradamt = cur.grsstradamt;
          return acc;
        }, {});
      });
    }
  }, [data]);

  if (loading) return 'Loading...';
  if (error) return `Error! ${error.message}`;

  return (
    <div className="w-100 m-10 justify-items-center">
      <Card>
        <CardHeader
          title={`Negociações por Minuto: ${variables.symbol} | ${variables.dt}`}
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
            <div className="w-3/4 h-auto">
              <div className="w-full h-full">
                <IntradayChartJS2 data={dataAggr} />
              </div>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={pooling}
                    onChange={handleChange}
                    name="pooling"
                  />
                }
                label="Atualização automática"
              />
            </div>
          ) : (
            <div>
              <div>
                <Typography variant="h4">GraphQL</Typography>
                <Typography variant="body1">
                  Esta gráfico recebe os dados através da consulta de dados via
                  GraphQL
                </Typography>
                <Typography variant="body1">
                  GraphQL: {print(GET_TRADES)}
                </Typography>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default IntradayChart;
