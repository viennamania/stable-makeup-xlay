'use client';

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Space_Grotesk } from "next/font/google";
import * as XLSX from "xlsx";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

type BankInfo = {
  bankName?: string;
  accountNumber?: string;
  accountHolder?: string;
};

type Order = {
  _id?: string;
  tradeId?: string;
  createdAt?: string;
  status?: string;
  usdtAmount?: number;
  krwAmount?: number;
  paymentMethod?: string;
  seller?: { bankInfo?: BankInfo };
  buyer?: { nickname?: string; depositName?: string; bankInfo?: BankInfo };
  store?: { storeName?: string; bankInfo?: BankInfo };
};

type TotalsByBank = {
  _id: string;
  totalCount: number;
  totalUsdtAmount: number;
  totalKrwAmount: number;
};

const statusBadge: Record<string, { label: string; bg: string; text: string }> = {
  paymentConfirmed: {
    label: "입금 확인",
    bg: "bg-emerald-500/15",
    text: "text-emerald-300",
  },
  accepted: {
    label: "진행 중",
    bg: "bg-cyan-500/15",
    text: "text-cyan-200",
  },
  paymentRequested: {
    label: "입금 요청",
    bg: "bg-amber-500/15",
    text: "text-amber-200",
  },
  cancelled: {
    label: "취소",
    bg: "bg-rose-500/15",
    text: "text-rose-200",
  },
  ordered: {
    label: "대기",
    bg: "bg-slate-500/15",
    text: "text-slate-200",
  },
};

function formatCurrency(value?: number, unit?: "₩" | "USDT") {
  if (value === undefined || value === null || Number.isNaN(value)) return "-";
  const formatted = value.toLocaleString("ko-KR");
  if (!unit) return formatted;
  return unit === "₩" ? `${unit}${formatted}` : `${formatted} ${unit}`;
}

function formatDateTime(value?: string) {
  if (!value) return "-";
  const date = new Date(value);
  return new Intl.DateTimeFormat("ko-KR", {
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(date);
}

function maskAccountNumber(account?: string) {
  if (!account) return "-";
  return account;
}

export default function BankClearanceHistoryPage({ params }: { params: { lang: string } }) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [accountNumber, setAccountNumber] = useState(searchParams.get("account") || "");
  const [page, setPage] = useState<number>(() => Number(searchParams.get("page")) || 1);
  const [limit, setLimit] = useState<number>(() => Number(searchParams.get("limit")) || 50);
  const [orders, setOrders] = useState<Order[]>([]);
  const [totals, setTotals] = useState({ totalCount: 0, totalUsdtAmount: 0, totalKrwAmount: 0 });
  const [bankBuckets, setBankBuckets] = useState<TotalsByBank[]>([]);
  const [statusFilter] = useState<"paymentConfirmed">("paymentConfirmed");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    const qpAccount = searchParams.get("account") || "";
    const qpPage = Number(searchParams.get("page") || page || 1);
    const qpLimit = Number(searchParams.get("limit") || limit || 50);

    const nextAccount = qpAccount || accountNumber;
    const normalizedPage = Number.isNaN(qpPage) ? 1 : qpPage;
    const normalizedLimit = Number.isNaN(qpLimit) ? limit : qpLimit;

    const needsFetch = qpAccount !== accountNumber || normalizedPage !== page || normalizedLimit !== limit || !lastUpdated;

    if (needsFetch) {
      setAccountNumber(nextAccount);
      setPage(normalizedPage);
      setLimit(normalizedLimit);
      fetchOrders(nextAccount, normalizedPage, normalizedLimit);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  async function fetchOrders(accountValue: string, pageValue: number = page, limitValue: number = limit) {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/order/getAllBuyOrders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          searchBuyerBankAccountNumber: accountValue?.trim() || "",
          page: pageValue,
          limit: limitValue,
          privateSale: true, // 청산 거래만
          searchMyOrders: false,
          searchOrderStatusCancelled: false,
          searchOrderStatusCompleted: true, // paymentConfirmed only
          manualConfirmPayment: false,
          userType: "all",
        }),
      });

      const json = await response.json();
      const result = json?.result || {};

      setOrders(result.orders || []);
      setPage(pageValue);
      setLimit(limitValue);
      setTotals({
        totalCount: result.totalCount || 0,
        totalUsdtAmount: result.totalUsdtAmount || 0,
        totalKrwAmount: result.totalKrwAmount || 0,
      });
      setBankBuckets(result.totalByBuyerBankAccountNumber || []);
      setLastUpdated(new Date());
    } catch (err) {
      console.error(err);
      setError("데이터를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  }

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => o.status === "paymentConfirmed");
  }, [orders]);

  const totalPages = useMemo(() => {
    const baseTotal = totals.totalCount || filteredOrders.length || 1;
    return Math.max(1, Math.ceil(baseTotal / (limit || 1)));
  }, [totals.totalCount, filteredOrders.length, limit]);

  function exportExcel() {
    if (!filteredOrders.length) return;

    const rows = filteredOrders.map((item) => ({
      생성일시: formatDateTime(item.createdAt),
      거래번호: item.tradeId || "-",
      상태: statusBadge[item.status || "ordered"]?.label || item.status,
      USDT금액: item.usdtAmount,
      KRW금액: item.krwAmount,
      구매자은행: `${item.buyer?.bankInfo?.bankName || "-"}`,
      구매자계좌: item.buyer?.bankInfo?.accountNumber || "-",
      예금주: item.buyer?.bankInfo?.accountHolder || "-",
      입금자명: item.buyer?.depositName || "-",
      구매자닉네임: item.buyer?.nickname || "-",
      가게: item.store?.storeName || "-",
      결제수단: item.paymentMethod || "-",
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "BankClearanceHistory");

    const suffix = accountNumber ? `-${accountNumber}` : "";
    const stamp = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(workbook, `bank-clearance-history${suffix}-${stamp}.xlsx`);
  }

  const primaryTone = "from-slate-900 via-slate-800 to-slate-900";

  return (
    <div className={`${spaceGrotesk.className} min-h-screen w-full bg-gradient-to-b ${primaryTone} text-slate-100 px-6 pb-16`}>
      <header className="mx-auto w-full max-w-6xl pt-6 pb-4">
        <div className="flex flex-col gap-3 rounded-3xl bg-gradient-to-r from-emerald-500/10 via-sky-500/10 to-blue-500/10 p-6 shadow-2xl ring-1 ring-white/5 backdrop-blur-xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Bank Clearance</p>
              <h1 className="text-3xl font-semibold text-white">계좌별 청산 내역</h1>
              <p className="text-slate-400">구매자 계좌번호로 청산거래(buyorders)만 필터링</p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push(`/${params.lang}/admin/bank-history`)}
                className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold text-white transition hover:border-slate-500 hover:bg-slate-800"
              >
                입금 내역으로
              </button>
              <button
                onClick={exportExcel}
                disabled={!filteredOrders.length}
                className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-950 shadow-lg shadow-emerald-900/30 transition hover:translate-y-[-1px] hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Excel 다운로드
              </button>
              <button
                onClick={() => fetchOrders(accountNumber, page, limit)}
                className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold text-white transition hover:border-slate-500 hover:bg-slate-800"
              >
                새로 고침
              </button>
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              setPage(1);
              fetchOrders(accountNumber, 1, limit);
            }}
            className="grid gap-3 sm:grid-cols-[1fr_auto_auto]"
          >
            <div className="flex items-center gap-3 rounded-2xl border border-slate-700 bg-slate-900/40 px-4 py-3 shadow-inner shadow-black/20">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-300">₩</div>
              <div className="flex-1">
                <p className="text-xs text-slate-500">구매자 계좌번호</p>
                <input
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="계좌번호 전체 또는 일부"
                  className="w-full bg-transparent text-lg font-semibold text-white outline-none placeholder:text-slate-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="h-full rounded-2xl bg-gradient-to-r from-emerald-500 to-sky-500 px-6 text-sm font-semibold text-emerald-950 shadow-lg shadow-emerald-900/30 transition hover:translate-y-[-1px]"
            >
              검색 실행
            </button>
          </form>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <section className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-slate-900/70 p-4 shadow-lg ring-1 ring-white/5">
            <p className="text-xs text-slate-500">총 거래건수</p>
            <p className="mt-2 text-3xl font-semibold text-white">{totals.totalCount.toLocaleString()}건</p>
            <p className="mt-2 text-xs text-slate-500">최근 업데이트 {lastUpdated ? formatDateTime(lastUpdated.toISOString()) : "-"}</p>
          </div>

          <div className="rounded-2xl bg-gradient-to-r from-emerald-500/15 to-emerald-500/5 p-4 shadow-lg ring-1 ring-emerald-500/30">
            <p className="text-xs text-emerald-200">USDT 합계</p>
            <p className="mt-2 text-3xl font-semibold text-white">{formatCurrency(totals.totalUsdtAmount, "USDT")}</p>
            <p className="mt-1 text-xs text-emerald-200/70">결제완료 기준</p>
          </div>

          <div className="rounded-2xl bg-gradient-to-r from-sky-500/15 to-blue-500/10 p-4 shadow-lg ring-1 ring-sky-500/30">
            <p className="text-xs text-sky-200">KRW 합계</p>
            <p className="mt-2 text-3xl font-semibold text-white">{formatCurrency(totals.totalKrwAmount, "₩")}</p>
            <p className="mt-1 text-xs text-sky-200/70">결제완료 기준</p>
          </div>
        </section>

        {bankBuckets.length > 0 && (
          <section className="rounded-2xl bg-slate-900/60 p-4 shadow-lg ring-1 ring-white/5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">구매자 계좌별 결제완료 상위</h2>
              <span className="text-xs text-slate-500">USDT 기준 내림차순</span>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              {bankBuckets.slice(0, 6).map((bucket) => (
                <div key={bucket._id} className="rounded-xl border border-slate-800 bg-slate-950/40 p-3 shadow-sm">
                  <p className="text-xs text-slate-500">{maskAccountNumber(bucket._id)}</p>
                  <p className="mt-1 text-lg font-semibold text-white">{formatCurrency(bucket.totalUsdtAmount, "USDT")}</p>
                  <p className="text-xs text-slate-400">{bucket.totalCount.toLocaleString()}건 • {formatCurrency(bucket.totalKrwAmount, "₩")}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="rounded-2xl bg-slate-950/60 p-4 shadow-xl ring-1 ring-white/5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-lg font-semibold text-white">거래 목록</h2>
                <p className="text-xs text-slate-500">최신순 • {filteredOrders.length.toLocaleString()}건 / 총 {totals.totalCount.toLocaleString()}건</p>
              </div>
            <div className="text-xs text-slate-500">결제완료 거래만 표시</div>
            </div>

          {error && <div className="mt-3 rounded-xl bg-rose-500/10 p-3 text-sm text-rose-200">{error}</div>}

          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-slate-400">
                  <th className="px-3 py-2">생성일시</th>
                  <th className="px-3 py-2">거래번호</th>
                  <th className="px-3 py-2">구매자 계좌</th>
                  <th className="px-3 py-2">금액</th>
                  <th className="px-3 py-2">구매자</th>
                  <th className="px-3 py-2">가게</th>
                  <th className="px-3 py-2">상태</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={7} className="px-3 py-6 text-center text-slate-500">데이터를 불러오는 중입니다...</td>
                  </tr>
                )}

                {!loading && !filteredOrders.length && (
                  <tr>
                    <td colSpan={7} className="px-3 py-6 text-center text-slate-500">표시할 내역이 없습니다.</td>
                  </tr>
                )}

                {!loading &&
                  filteredOrders.map((item) => {
                    const badge = statusBadge[item.status || "ordered"] || statusBadge.ordered;
                    return (
                      <tr key={item._id || item.tradeId} className="border-t border-slate-800/60 hover:bg-slate-900/50">
                        <td className="px-3 py-3 text-slate-200">{formatDateTime(item.createdAt)}</td>
                        <td className="px-3 py-3 font-semibold text-white">{item.tradeId || "-"}</td>
                        <td className="px-3 py-3 text-slate-200">
                          <div className="text-sm font-semibold text-white">{item.buyer?.bankInfo?.bankName || "-"}</div>
                          <div className="text-xs text-slate-400">{maskAccountNumber(item.buyer?.bankInfo?.accountNumber)}</div>
                          <div className="text-xs text-slate-400">{item.buyer?.bankInfo?.accountHolder || "-"}</div>
                        </td>
                        <td className="px-3 py-3">
                          <div className="font-semibold text-white">{formatCurrency(item.usdtAmount, "USDT")}</div>
                          <div className="text-xs text-slate-400">{formatCurrency(item.krwAmount, "₩")}</div>
                        </td>
                        <td className="px-3 py-3 text-slate-200">
                          <div className="font-semibold text-white">{item.buyer?.nickname || "-"}</div>
                          <div className="text-xs text-slate-400">입금자명: {item.buyer?.depositName || "-"}</div>
                        </td>
                        <td className="px-3 py-3 text-slate-200">
                          <div className="font-semibold text-white">{item.store?.storeName || "-"}</div>
                          <div className="text-xs text-slate-500">{item.paymentMethod || "-"}</div>
                        </td>
                        <td className="px-3 py-3">
                          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${badge.bg} ${badge.text}`}>{badge.label}</span>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-slate-500">페이지 {page} / {totalPages} · 현재 {filteredOrders.length}건 · 총 {totals.totalCount.toLocaleString()}건</div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={limit}
                onChange={(e) => {
                  const nextLimit = Number(e.target.value) || 50;
                  setPage(1);
                  fetchOrders(accountNumber, 1, nextLimit);
                }}
                className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-white"
              >
                {[20, 50, 100, 200, 300].map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}건씩
                  </option>
                ))}
              </select>

              <button
                type="button"
                disabled={loading || page <= 1}
                onClick={() => fetchOrders(accountNumber, Math.max(1, page - 1), limit)}
                className="rounded-lg border border-slate-800 px-3 py-2 text-sm text-white transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
              >
                이전
              </button>
              <button
                type="button"
                disabled={loading || page >= totalPages}
                onClick={() => fetchOrders(accountNumber, Math.min(totalPages, page + 1), limit)}
                className="rounded-lg border border-slate-800 px-3 py-2 text-sm text-white transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
              >
                다음
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
