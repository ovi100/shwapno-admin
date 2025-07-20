import React, { useEffect, useMemo, useState } from "react";
import { IoChevronDown, IoChevronUp } from "react-icons/io5";

type ColumnDef = {
  label: string;
  key: string;
  sticky?: boolean;
  calcTotal?: boolean;
};

type TableProps = {
  rows: object[];
  columns?: ColumnDef[];
  perPage?: number;
  stickyColumnKeys?: string[];
  searchable?: boolean;
  searchApi?: (term: string) => Promise<JSON[]>;
};

const formatHeader = (key: string) =>
  key
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (char) => char.toUpperCase());

const Table: React.FC<TableProps> = ({
  rows,
  columns,
  perPage = 10,
  stickyColumnKeys = [],
  searchable = false,
  searchApi,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searching, setSearching] = useState(false);
  const [internalRows, setInternalRows] = useState<any[]>(rows);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPerPage, setSelectedPerPage] = useState(perPage);

  // Debounced search
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (searchTerm.trim() && searchApi) {
        setSearching(true);
        try {
          const data = await searchApi(searchTerm.trim());
          setInternalRows(data);
        } catch (err) {
          console.error("Search API failed. Falling back to local search.");
          setInternalRows(rows);
        }
        setSearching(false);
      } else {
        setInternalRows(rows);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, searchApi, rows]);

  // Generate columns if not provided
  const columnDefs: ColumnDef[] = useMemo(() => {
    if (columns) return columns;
    if (rows.length === 0) return [];
    return Object.keys(rows[0]).map((key) => ({
      label: formatHeader(key),
      key,
    }));
  }, [columns, rows]);

  const filteredRows = useMemo(() => {
    if (searchTerm && !searchApi) {
      return internalRows.filter((row) =>
        Object.values(row).some((val) =>
          String(val).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
    return internalRows;
  }, [internalRows, searchTerm, searchApi]);

  const sortedRows = useMemo(() => {
    if (!sortKey) return filteredRows;
    const sorted = [...filteredRows].sort((a, b) => {
      const aValue = a[sortKey];
      const bValue = b[sortKey];

      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
      }

      return sortDirection === "asc"
        ? String(aValue).localeCompare(String(bValue))
        : String(bValue).localeCompare(String(aValue));
    });
    return sorted;
  }, [filteredRows, sortKey, sortDirection]);

  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * selectedPerPage;
    return sortedRows.slice(start, start + selectedPerPage);
  }, [sortedRows, currentPage, selectedPerPage]);

  const totalPages = Math.ceil(filteredRows.length / selectedPerPage);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  const getTotalForColumn = (key: string) => {
    return filteredRows.reduce((sum, row) => {
      const value = row[key];
      return typeof value === "number" ? sum + value : sum;
    }, 0);
  };

  return (
    <div className="w-full overflow-auto space-y-4">
      {searchable && (
        <input
          type="text"
          className="border rounded px-3 py-1 w-full md:w-1/3"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
        />
      )}

      <table className="min-w-full border border-collapse border-gray-300 rounded-md">
        <thead className="bg-gray-100">
          <tr>
            {columnDefs.map((col) => (
              <th
                key={col.key}
                className={`px-4 py-2 border text-left cursor-pointer ${
                  stickyColumnKeys.includes(col.key)
                    ? "sticky left-0 bg-gray-100 z-10"
                    : ""
                }`}
                onClick={() => handleSort(col.key)}
              >
                <div className="flex items-center justify-between gap-1">
                  <span>{col.label}</span>
                  {sortKey === col.key ? (
                    sortDirection === "asc" ? (
                      <IoChevronUp />
                    ) : (
                      <IoChevronDown />
                    )
                  ) : (
                    <IoChevronDown className="opacity-30" />
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {paginatedRows.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-gray-50">
              {columnDefs.map((col) => (
                <td
                  key={col.key}
                  className={`px-4 py-2 border ${
                    stickyColumnKeys.includes(col.key)
                      ? "sticky left-0 bg-white z-0"
                      : ""
                  }`}
                >
                  {row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        {columnDefs.some((col) => col.calcTotal) && (
          <tfoot className="bg-gray-100 font-medium">
            <tr>
              {columnDefs.map((col) => (
                <td key={col.key} className="px-4 py-2 border">
                  {col.calcTotal ? getTotalForColumn(col.key) : ""}
                </td>
              ))}
            </tr>
          </tfoot>
        )}
      </table>

      <div className="flex justify-between items-center gap-2 flex-wrap">
        <div>
          Rows per page:
          <select
            className="ml-2 border rounded px-2 py-1"
            value={selectedPerPage}
            onChange={(e) => {
              setSelectedPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
          >
            {[5, 10, 20, 50].map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        <div className="space-x-2">
          <button
            className="px-3 py-1 border rounded"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
          >
            Prev
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            className="px-3 py-1 border rounded"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default Table;
