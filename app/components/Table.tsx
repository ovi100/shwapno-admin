import React, { useMemo, useState } from "react";
import { debounce, formatHeader, getArrayType } from "../utils";
import { IoSearchOutline, IoCloseOutline } from "react-icons/io5";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

type HeaderItem = {
  label: string;
  key: string;
};

type TableRow = { [key: string]: any };

type operationItem = {
  key: string;
  operation: "count" | "sum" | "average" | "unique" | "min" | "max";
};

type TableProps = {
  data: TableRow[];
  headers?: HeaderItem[];
  totalItems?: number;
  perPage?: number;
  currentPage?: number;
  showAllCheck?: boolean;
  isCheckable?: boolean;
  columnOperations?: operationItem[];
  stickyColumns?: string[];
  searchable?: boolean;
  exportable?: boolean;
  onLimitChange: (value: number) => void;
  onPageChange: (page: number) => Promise<void>;
  onSearch?: (term: string) => Promise<void>;
  onChecked?: (items: any[]) => void;
};

const Table: React.FC<TableProps> = ({
  data = [],
  headers = null,
  totalItems = 0,
  perPage = 10,
  currentPage = 1,
  stickyColumns = [],
  columnOperations = [],
  onLimitChange,
  onPageChange = null,
  searchable = false,
  exportable = false,
  onSearch = null,
  showAllCheck = true,
  isCheckable = false,
  onChecked = null,
}) => {
  const [checkedItems, setCheckedItems] = useState<object[]>([]);
  const [search, setSearch] = useState<string>("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  // Generate pages based on total items and per page
  const pages = useMemo(() => {
    const totalPages = Math.ceil(totalItems / perPage);
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
    return pages.length > 0 ? pages : [];
  }, [totalItems, perPage]);

  // Debounced search
  const debouncedSearch = onSearch ? debounce(onSearch, 500) : null;

  // Generate headers
  const tableHeaders = useMemo(() => {
    if (headers) return headers;
    if (data.length === 0) return [];
    return Object.keys(data[0]).map((key) => ({
      label: formatHeader(key),
      key,
    }));
  }, [headers, data]);

  const toggleCheckAll = () => {
    if (checkedItems.length === data.length) {
      setCheckedItems([]);
      onChecked && onChecked([]);
    } else {
      setCheckedItems(data);
      onChecked && onChecked(data);
    }
  };

  const handlePageChange = async (page: number) => {
    if (onPageChange) {
      await onPageChange(page);
    }
  };

  const handleCheckboxChange = (item: object) => {
    setCheckedItems((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const filteredData = useMemo(() => {
    return data.filter((item) =>
      tableHeaders.some((col) => {
        const val = item[col.key];
        return typeof val === "string" || typeof val === "number"
          ? val.toString().toLowerCase().includes(search.toLowerCase())
          : false;
      })
    );
  }, [data, tableHeaders, search]);

  const sortedData = useMemo(() => {
    if (!sortKey) {
      return filteredData;
    }
    return filteredData.sort((a, b) => {
      if (a[sortKey] < b[sortKey]) {
        return sortAsc ? -1 : 1;
      }
      if (a[sortKey] > b[sortKey]) {
        return sortAsc ? 1 : -1;
      }
      return 0;
    });
  }, [filteredData, sortKey, sortAsc]);

  const toggleSort = (key: string) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  // Calculate column values if needed
  const calculatedColumns = useMemo(() => {
    const results = columnOperations.map(({ key, operation }) => {
      let value;
      const columnData = sortedData.map((item) => item[key]);
      const dataType = getArrayType(columnData);
      const sum = columnData.reduce((sum, item) => sum + item, 0);

      switch (operation) {
        case "count":
          value = columnData.length;
          break;
        case "sum":
          value = dataType == "number" ? sum : "#N/A";
          break;
        case "average":
          value = dataType == "number" ? sum / columnData.length : "#N/A";
          break;
        case "unique":
          value = [...new Set(columnData)].length;
          break;
        case "min":
          value = dataType == "number" ? Math.min(...columnData) : "#N/A";
          break;
        case "max":
          value = dataType == "number" ? Math.max(...columnData) : "#N/A";
          break;
        default:
          value = null;
      }

      // Format the value to remove decimal places if it's an integer
      value = Number.isInteger(value)
        ? value.toString()
        : isNaN(value)
        ? value
        : value.toFixed(2);

      return {
        key: key,
        operation: operation,
        value: value,
      };
    });
    return results;
  }, [columnOperations, sortedData]);

  const exportToExcel = async (format: "xlsx" | "csv") => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Sheet 1");

    // Add headers with styling
    const headerRow = worksheet.addRow(tableHeaders.map((col) => col.label));

    // Style the header row
    headerRow.eachCell((cell) => {
      cell.font = {
        size: 13,
        color: { argb: "FFFFFFFF" },
      };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF000000" },
      };
      cell.alignment = { vertical: "middle", horizontal: "center" };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });

    // Add data
    sortedData.forEach((row) => {
      worksheet.addRow(tableHeaders.map((col) => row[col.key]));
    });

    // Add calculated values if any
    // if (Object.keys(calculatedColumns).length > 0) {
    //   worksheet.addRow([]); // Empty row
    //   worksheet.addRow(["Calculated Values"]);
    //   tableHeaders.forEach((col) => {
    //     if (calculatedColumns[col.key]) {
    //       worksheet.addRow([col.label, calculatedColumns[col.key]]);
    //     }
    //   });
    // }

    // Generate file
    if (format === "xlsx") {
      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(new Blob([buffer]), "table_data.xlsx");
    } else {
      const buffer = await workbook.csv.writeBuffer();
      saveAs(new Blob([buffer]), "table_data.csv");
    }
  };

  const handleExport = (format: "xlsx" | "csv") => {
    switch (format) {
      case "xlsx":
        exportToExcel("xlsx");
        break;
      case "csv":
        exportToExcel("csv");
        break;
    }
  };

  const handleSearch = (term: string) => {
    if (!debouncedSearch) return;
    setSearch(term);

    term === "" ? handlePageChange(1) : debouncedSearch(term);
  };

  return (
    <>
      <div className="flex items-center justify-between gap-1 md:gap-0 mb-4">
        {searchable && (
          <div className="search-box">
            <div className="relative md:mt-1">
              <div className="absolute inset-y-0 rtl:inset-r-0 start-0 flex items-center ps-3 pointer-events-none">
                <IoSearchOutline className="text-gray-500" />
              </div>
              <input
                type="text"
                id="table-search"
                className="w-52 md:w-76 h-9 bg-white block px-10 py-2 text-sm text-gray-500 border border-gray-300 rounded-md focus:outline-none"
                placeholder="Search anything..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
              />
              {search && (
                <button
                  className="absolute inset-y-0 rtl:inset-r-0 end-2 flex items-center ps-3 cursor-pointer"
                  onClick={() => handleSearch("")}
                >
                  <IoCloseOutline className="text-gray-500" />
                </button>
              )}
            </div>
          </div>
        )}
        {exportable && (
          <select
            id="export"
            className="w-2/5 md:w-auto h-9 bg-white border border-gray-300 text-sm rounded-md ms-0 px-2 focus:outline-none"
            defaultValue="Export Data"
            onChange={(e) => handleExport(e.target.value as "xlsx" | "csv")}
          >
            <option value="">Export Data</option>
            <option value="xlsx">xlsx</option>
            <option value="csv">csv</option>
          </select>
        )}
      </div>
      <div className="relative max-h-[460px] overflow-auto rounded-lg">
        {sortedData.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-10"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.182 16.318A4.486 4.486 0 0 0 12.016 15a4.486 4.486 0 0 0-3.198 1.318M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Z"
              />
            </svg>

            <p className="text-gray-500 mt-3">No data found</p>
          </div>
        )}
        {sortedData.length > 0 && (
          <table className="w-full relative text-sm text-gray-500">
            <thead className="bg-white sticky top-0 text-xs text-gray-700 uppercase z-10">
              <tr className="relative">
                {isCheckable && (
                  <th
                    scope="col"
                    className="px-2 py-3 border-2 border-t-0 border-l-0 border-blue-100/50"
                  >
                    {showAllCheck ? (
                      <input
                        id="checkbox-all-search"
                        type="checkbox"
                        className="w-3.5 h-3.5 text-blue-600 bg-gray-100 border-gray-300 rounded-sm"
                        checked={checkedItems.length === data.length}
                        onChange={toggleCheckAll}
                      />
                    ) : (
                      ""
                    )}
                  </th>
                )}
                {tableHeaders.map((header) => (
                  <th
                    key={header.key}
                    scope="col"
                    className={`${
                      stickyColumns.includes(header.key)
                        ? "sticky -left-1 bg-white z-10"
                        : ""
                    } border-2 border-t-0 border-l-0 last:border-r-0 border-blue-100/50 hover:cursor-pointer px-4 py-3`}
                  >
                    <div
                      className="flex items-center justify-center gap-1"
                      onClick={() => toggleSort(header.key)}
                    >
                      <span>{header.label}</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.2}
                        stroke="currentColor"
                        className={`size-4 ${
                          sortKey === header.key
                            ? "text-black"
                            : "text-gray-300"
                        } transition duration-300 ${
                          !sortAsc && sortKey === header.key ? "rotate-180" : ""
                        } `}
                        // ${sortKey === header.key ? "opacity-100" : "opacity-0"}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M8.25 6.75 12 3m0 0 3.75 3.75M12 3v18"
                        />
                      </svg>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedData.map((row, index) => (
                <tr
                  className={`relative group ${
                    checkedItems.includes(row) ? "bg-blue-50" : "bg-white"
                  } hover:bg-blue-50 hover:cursor-pointer`}
                  key={index}
                >
                  {isCheckable && (
                    <th
                      scope="col"
                      className="px-2 py-2 border-2 border-t-0 border-l-0 border-blue-100/50"
                    >
                      <input
                        id="checkbox-all-search"
                        type="checkbox"
                        className="w-3.5 h-3.5 text-blue-600 bg-gray-100 border-gray-300 rounded-sm"
                        checked={checkedItems.includes(row)}
                        onChange={() => handleCheckboxChange(row)}
                      />
                    </th>
                  )}
                  {tableHeaders.map((col) => (
                    <td
                      key={col.key}
                      className={`${
                        stickyColumns.includes(col.key)
                          ? "sticky -left-1 bg-white group-hover:bg-blue-50 z-10 group-hover:z-0"
                          : ""
                      } border-2 border-t-0 border-l-0 last:border-r-0 border-blue-100/50 text-center px-4 py-2`}
                    >
                      {row[col.key]}
                    </td>
                  ))}
                </tr>
              ))}
              {calculatedColumns.length > 0 && (
                <tr className="relative group bg-white hover:bg-blue-50 hover:cursor-pointer">
                  {isCheckable && (
                    <td className="px-4 py-2 border-2 border-t-0 border-l-0 last:border-r-0 border-blue-100/50 text-center"></td>
                  )}
                  {tableHeaders.map((header) => {
                    const columnItem = calculatedColumns.find(
                      (r) => r.key === header.key
                    );
                    return (
                      <td
                        key={`result-${header.key}`}
                        className={`${
                          stickyColumns.includes(header.key)
                            ? "sticky -left-1 bg-white group-hover:bg-blue-50 z-10 group-hover:z-0"
                            : ""
                        } border-2 border-t-0 border-l-0 last:border-r-0 border-blue-100/50 text-xs text-slate-600 font-medium text-center capitalize px-4 py-2`}
                      >
                        {columnItem
                          ? `${columnItem.operation + " = "} ${
                              columnItem.value
                            }`
                          : ""}
                      </td>
                    );
                  })}
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
      {pages.length > 1 && (
        <nav
          className="flex items-center justify-end gap-x-3 mt-5"
          aria-label="Table navigation"
        >
          <select
            id="per-page"
            className="h-9 bg-white border border-gray-300 text-sm rounded-md focus:outline-none"
            value={perPage}
            onChange={(e) =>
              onLimitChange(
                Number(e.target.value) == 0 ? 10 : Number(e.target.value)
              )
            }
          >
            <option value="">Row/Page</option>
            <option value="10">10</option>
            <option value="15">15</option>
            <option value="20">20</option>
            <option value="25">25</option>
            <option value="30">30</option>
            <option value="35">35</option>
          </select>
          <ul className="inline-flex -space-x-px rtl:space-x-reverse text-sm h-8">
            <li>
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                className="flex items-center justify-center px-2.5 lg:px-3 h-9 ms-0 leading-tight text-xs lg:text-sm font-medium text-gray-700 
                  bg-white rounded-s-lg border border-gray-300 hover:bg-gray-100 hover:text-gray-700 capitalize cursor-pointer"
                disabled={currentPage === 1}
              >
                <span className="hidden lg:block">previous</span>
                <span className="block lg:hidden">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="size-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 19.5 8.25 12l7.5-7.5"
                    />
                  </svg>
                </span>
              </button>
            </li>
            {pages.slice(0, 2).map((page) => (
              <li key={page}>
                <button
                  onClick={() => handlePageChange(page)}
                  className={`flex items-center justify-center px-2.5 lg:px-3 h-9 ms-0 leading-tight text-xs lg:text-sm text-gray-500 
                  ${
                    page === currentPage ? "bg-blue-200" : "bg-white"
                  } border border-gray-300 hover:bg-gray-100 hover:text-gray-700 cursor-pointer`}
                >
                  {page}
                </button>
              </li>
            ))}
            <div>
              <input
                className={`w-9 px-1 h-9 ${
                  pages.slice(0, 2).includes(currentPage) ||
                  pages.slice(-2).includes(currentPage)
                    ? "bg-white"
                    : "bg-blue-200"
                } border border-gray-300 text-xs lg:test-sm text-center focus:outline-none`}
                placeholder="..............."
                value={
                  pages.slice(0, 2).includes(currentPage) ||
                  pages.slice(-2).includes(currentPage)
                    ? ""
                    : currentPage
                }
                onChange={(e) => handlePageChange(Number(e.target.value))}
              />
            </div>
            {pages.slice(-2).map((page) => (
              <li key={page}>
                <button
                  onClick={() => handlePageChange(page)}
                  className={`flex items-center justify-center px-2.5 lg:px-3 h-9 ms-0 leading-tight text-xs lg:text-sm text-gray-500 
                  ${
                    page === currentPage ? "bg-blue-200" : "bg-white"
                  } border border-gray-300 hover:bg-gray-100 hover:text-gray-700 cursor-pointer`}
                >
                  {page}
                </button>
              </li>
            ))}
            <li>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                className="flex items-center justify-center px-2 lg:px-3 h-9 ms-0 leading-tight text-xs lg:text-sm font-medium text-gray-700 
                  bg-white rounded-e-lg border border-gray-300 hover:bg-gray-100 hover:text-gray-700 capitalize"
                disabled={currentPage > pages.length}
              >
                <span className="hidden lg:block">next</span>
                <span className="block lg:hidden">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="size-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m8.25 4.5 7.5 7.5-7.5 7.5"
                    />
                  </svg>
                </span>
              </button>
            </li>
          </ul>
        </nav>
      )}
    </>
  );
};

export default Table;
