import React, { useState } from 'react';
import { TradeRecord } from '../../types';
import { History, Download, TrendingUp, TrendingDown, Check } from 'lucide-react';

interface TradeHistoryTableProps {
  trades: TradeRecord[];
}

export const TradeHistoryTable: React.FC<TradeHistoryTableProps> = ({ trades }) => {
  const [filter, setFilter] = useState<'ALL' | 'BUY' | 'SELL'>('ALL');
  const [isExported, setIsExported] = useState(false);

  const filteredTrades = trades.filter((t) => {
    if (filter === 'BUY') return t.type === 'BUY';
    if (filter === 'SELL') return t.type === 'SELL';
    return true;
  });

  const handleExportCSV = () => {
    if (trades.length === 0) return;
    const headers = ['TradeID', 'Timestamp', 'Type', 'Symbol', 'Shares', 'Price', 'Fee', 'Total', 'RealizedPnL'];
    const rows = trades.map((t) => [
      t.id,
      `"${t.timestamp}"`,
      t.type,
      t.symbol,
      t.shares,
      t.price,
      t.fee,
      t.total,
      t.realizedPnl !== undefined ? t.realizedPnl : ''
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `apex_trade_history_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setIsExported(true);
    setTimeout(() => setIsExported(false), 2000);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl backdrop-blur-md">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">Simulated Trade History &amp; Audit Log</h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Full ledger of executed market orders, commissions, slippage, and realized returns
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Filters */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            {(['ALL', 'BUY', 'SELL'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                  filter === type
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Export CSV */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition-colors shadow-sm"
          >
            {isExported ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Download className="w-3.5 h-3.5 text-slate-400" />}
            <span>{isExported ? 'CSV Exported' : 'Export CSV'}</span>
          </button>
        </div>
      </div>

      {/* Trades Table */}
      {filteredTrades.length === 0 ? (
        <div className="text-center py-10 text-xs text-slate-500">
          No trade records found matching filter.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[11px] font-sans">
                <th className="pb-3 pl-2">Time</th>
                <th className="pb-3">Type</th>
                <th className="pb-3">Asset</th>
                <th className="pb-3 text-right">Shares</th>
                <th className="pb-3 text-right">Exec Price</th>
                <th className="pb-3 text-right">Fee</th>
                <th className="pb-3 text-right">Total Amount</th>
                <th className="pb-3 text-right pr-2">Realized P&amp;L</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredTrades.map((trade) => {
                const isBuy = trade.type === 'BUY';
                return (
                  <tr key={trade.id} className="hover:bg-slate-850/50 transition-colors">
                    {/* Timestamp */}
                    <td className="py-3 pl-2 text-slate-400 text-[11px]">
                      {trade.timestamp}
                    </td>

                    {/* Order Type */}
                    <td className="py-3 font-sans">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isBuy ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}>
                        {trade.type}
                      </span>
                    </td>

                    {/* Symbol & Name */}
                    <td className="py-3 font-bold text-white">
                      {trade.symbol}
                      <span className="text-[10px] text-slate-500 font-sans block truncate max-w-[120px]">
                        {trade.name}
                      </span>
                    </td>

                    {/* Shares */}
                    <td className="py-3 text-right text-slate-200">
                      {trade.shares}
                    </td>

                    {/* Executed Price */}
                    <td className="py-3 text-right text-slate-200 font-semibold">
                      ${trade.price.toFixed(2)}
                    </td>

                    {/* Transaction Fee */}
                    <td className="py-3 text-right text-amber-400">
                      ${trade.fee.toFixed(2)}
                    </td>

                    {/* Total Cash Settlement */}
                    <td className="py-3 text-right font-bold text-white">
                      ${trade.total.toFixed(2)}
                    </td>

                    {/* Realized P&L */}
                    <td className="py-3 text-right pr-2">
                      {trade.realizedPnl !== undefined ? (
                        <span className={`font-bold flex items-center justify-end gap-1 ${
                          trade.realizedPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}>
                          {trade.realizedPnl >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {trade.realizedPnl >= 0 ? '+' : ''}${trade.realizedPnl.toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

