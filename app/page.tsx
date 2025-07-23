"use client";
import Image from "next/image";
import { Button, Switch, Tab, Table } from "./components";
import { FiUser, FiSettings } from "react-icons/fi";
import { BiCheckCircle } from "react-icons/bi";
import { useEffect, useMemo, useState } from "react";
import { IoSearchOutline, IoCloseOutline } from "react-icons/io5";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
const API_URL = "https://dummyjson.com/users";

const Home = () => {
  const [enabled, setEnabled] = useState<boolean>(false);
  const showAllCheck: boolean = true;
  const isCheckable: boolean = true;
  const calculateColumns: object[] = [
    { column: "age", calculate: "min" },
    { column: "role", calculate: "unique" },
    { column: "gender", calculate: "unique" },
    { column: "weight", calculate: "average" },
    { column: "bloodGroup", calculate: "unique" },
  ];
  const [rows, setRows] = useState<object[]>([]);
  const [checkedItems, setCheckedItems] = useState<object[]>([]);
  const [search, setSearch] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pages, setPages] = useState<number[]>([]);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortAsc, setSortAsc] = useState<boolean>(true);
  const [perPage, setPerPage] = useState<number>(10);

  type User = {
    firstName: string;
    age: number;
    role: string;
    gender: string;
    weight: number;
    bloodGroup: string;
  };

  const debounce = (func: (...args: any[]) => void, delay: number) => {
    let timer: NodeJS.Timeout;
    return (...args: any[]) => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => func(...args), delay);
    };
  };

  const formatHeader = (key: string) =>
    key
      .replace(/_/g, " ")
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/\b\w/g, (char) => char.toUpperCase());

  // Fetch initial data from dummyjson
  const fetchUsers = async (page: number = 1) => {
    const skip = (page - 1) * perPage;
    const response = await fetch(
      API_URL +
        `?limit=${perPage}&skip=${skip}&select=firstName,age,role,gender,weight,bloodGroup`
    );
    const result = await response.json();
    const data = result.users;
    const totalPages = Math.ceil(result.total / perPage);
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
    setPages(pages);
    setCurrentPage(page);
    setSortKey(null);
    setSortAsc(true);
    setCheckedItems([]);
    setSearch("");
    setRows(data);
  };
  useEffect(() => {
    fetchUsers();
  }, [perPage]);

  const handlePageChange = async (page: number) => {
    await fetchUsers(page);
    setCurrentPage(page);
  };

  // Optional: search API function
  const searchUsers = async (query: string) => {
    try {
      const response = await fetch(
        API_URL + `/search?q=${encodeURIComponent(query)}`
      );
      const result = await response.json();
      const data = result.users.map((user: User) => ({
        firstName: user.firstName,
        age: user.age,
        role: user.role,
        gender: user.gender,
        weight: user.weight,
        bloodGroup: user.bloodGroup,
      }));
      setRows(data);
    } catch (error) {
      console.error("Error searching users:", error);
    }
  };

  const debouncedSearch = debounce(searchUsers, 500);

  const headers = useMemo(() => {
    // if (columns) return columns;
    if (rows.length === 0) return [];
    return Object.keys(rows[0]).map((key) => ({
      label: formatHeader(key),
      key,
    }));
  }, [rows]);

  const toggleCheckAll = () => {
    if (checkedItems.length === rows.length) {
      setCheckedItems([]);
    } else {
      setCheckedItems(rows);
    }
  };

  const handleCheckboxChange = (item: object) => {
    setCheckedItems((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const filteredData = useMemo(() => {
    return rows.filter((row) =>
      headers.some((col) => {
        const val = row[col.key];
        return typeof val === "string" || typeof val === "number"
          ? val.toString().toLowerCase().includes(search.toLowerCase())
          : false;
      })
    );
  }, [rows, headers, search]);

  const sortedData = useMemo(() => {
    if (!sortKey) {
      return filteredData;
    }
    return [...filteredData].sort((a, b) => {
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

  const getArrayType = (array: any) => {
    if (!Array.isArray(array) || array.length === 0) return null;

    const firstType = typeof array[0];
    const allSameType = array.every((item) => typeof item === firstType);

    return allSameType ? firstType : "mixed";
  };

  // Calculate column values if needed
  const calculatedColumns = useMemo(() => {
    const results = calculateColumns.map(({ column, calculate }) => {
      let value;
      const columnData = sortedData.map((item) => item[column]);
      const dataType = getArrayType(columnData);
      const sum = columnData.reduce((sum, item) => sum + item, 0);

      switch (calculate) {
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
        key: column,
        operation: calculate,
        value: value,
      };
    });
    return results;
  }, [calculateColumns, sortedData]);

  const exportToExcel = async (format: "xlsx" | "csv") => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Sheet 1");

    // Add headers with styling
    const headerRow = worksheet.addRow(headers.map((col) => col.label));

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

    // Add data rows
    sortedData.forEach((row) => {
      worksheet.addRow(headers.map((col) => row[col.key]));
    });

    // Add calculated values if any
    // if (Object.keys(calculatedColumns).length > 0) {
    //   worksheet.addRow([]); // Empty row
    //   worksheet.addRow(["Calculated Values"]);
    //   headers.forEach((col) => {
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

  // const columns = [
  //   { label: "ID", key: "id" },
  //   { label: "First Name", key: "firstName", sticky: true },
  //   { label: "Last Name", key: "lastName" },
  //   { label: "Email", key: "email" },
  //   { label: "Age", key: "age", calcTotal: true },
  //   { label: "Gender", key: "gender" },
  //   { label: "Role", key: "role" },
  //   { label: "Phone", key: "phone" },
  // ];

  const tabs = [
    {
      label: "Profile",
      content: (
        <div>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris nisi ut
          aliquip ex ea commodo consequat. Duis aute irure dolor in
          reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
          pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
          culpa qui officia deserunt mollit anim id est laborum.
        </div>
      ),
      icon: <FiUser className="text-blue-600" />,
    },
    {
      label: "Settings",
      content: <div>Settings Content</div>,
      icon: <FiSettings className="text-black" />,
    },
  ];

  console.log(sortedData);

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-md flex flex-col items-center justify-center gap-2">
        <Button
          text="Deploy now"
          size="medium"
          variant="success"
          loading={true}
          onClick={() => alert("button clicked")}
        />
        <Button
          text="Deploy now"
          size="large"
          variant="danger"
          edge="capsule"
          icon={<BiCheckCircle />}
          onClick={() => alert("button clicked")}
        />
        <Button onClick={() => alert("button clicked")}>
          <div className="flex items-center">
            <Image
              className="dark:invert"
              src="/vercel.svg"
              alt="Vercel-logo"
              width={20}
              height={20}
            />
            <span className="ml-2">My Button</span>
          </div>
        </Button>
        <Button
          text=""
          edge="circular"
          icon={
            <Image
              className="dark:invert"
              src="/vercel.svg"
              alt="Vercel-logo"
              width={20}
              height={20}
            />
          }
          onClick={() => alert("button clicked")}
        />
      </div>
      <div className="tab bg-gray-100 mt-5 p-8">
        <Tab
          tabs={tabs}
          theme="capsule"
          variant="primary"
          type="horizontal"
          trackVisibility={true}
        />
      </div>
      <div className="switch flex gap-3 mt-10">
        <Switch
          value={enabled}
          size="small"
          noChange={() => setEnabled(!enabled)}
        />
        <Switch
          value={enabled}
          size="small"
          type="square"
          noChange={() => setEnabled(!enabled)}
        />
      </div>
      <div className="data-table bg-gray-50 mt-5 p-5">
        {/* <h1 className="text-2xl font-bold mb-4">User Data</h1>
        <Table
          rows={rows}
          // columns={columns}
          perPage={perPage}
          stickyColumnKeys={["firstName"]}
          searchable={true}
          searchApi={searchUsers}
        /> */}
        <div className="flex items-center justify-between">
          <div className="search-box pb-4">
            <div className="relative mt-1">
              <div className="absolute inset-y-0 rtl:inset-r-0 start-0 flex items-center ps-3 pointer-events-none">
                <IoSearchOutline className="text-gray-500" />
              </div>
              <input
                type="text"
                id="table-search"
                className="w-76 bg-white block px-10 py-2 text-sm text-gray-500 border border-gray-300 rounded-md focus:outline-none"
                placeholder="Search anything..."
                value={search}
                // onChange={(e) => setSearch(e.target.value)}
                onChange={(e) => {
                  setSearch(e.target.value);
                  debouncedSearch(e.target.value);
                }}
              />
              {search && (
                <button
                  className="absolute inset-y-0 rtl:inset-r-0 end-2 flex items-center ps-3 cursor-pointer"
                  onClick={() => setSearch("")}
                >
                  <IoCloseOutline className="text-gray-500" />
                </button>
              )}
            </div>
          </div>
          <select
            id="export"
            className="h-9 bg-white border border-gray-300 text-sm rounded-md ms-0 px-2 focus:outline-none"
            onChange={(e) => handleExport(e.target.value as "xlsx" | "csv")}
          >
            <option value="">Export Table</option>
            <option value="xlsx">xlsx</option>
            <option value="csv">csv</option>
          </select>
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
                <tr className="">
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
                          checked={checkedItems.length === rows.length}
                          onChange={toggleCheckAll}
                        />
                      ) : (
                        ""
                      )}
                    </th>
                  )}
                  {headers.map((header) => (
                    <th
                      key={header.key}
                      scope="col"
                      className="px-4 py-3 border-2 border-t-0 border-l-0 last:border-r-0 border-blue-100/50 hover:cursor-pointer"
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
                          className={`size-4 text-black transition duration-300 ${
                            !sortAsc ? "rotate-180" : ""
                          } ${
                            sortKey === header.key ? "opacity-100" : "opacity-0"
                          }`}
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
                    className={`${
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
                    {headers.map((col) => (
                      <td
                        key={col.key}
                        className="px-4 py-2 border-2 border-t-0 border-l-0 last:border-r-0 border-blue-100/50 text-center"
                      >
                        {row[col.key]}
                      </td>
                    ))}
                  </tr>
                ))}
                {calculatedColumns.length > 0 && (
                  <tr className="bg-white hover:bg-blue-50 hover:cursor-pointer">
                    {isCheckable && (
                      <td className="px-4 py-2 border-2 border-t-0 border-l-0 last:border-r-0 border-blue-100/50 text-center"></td>
                    )}
                    {headers.map((header) => {
                      const columnItem = calculatedColumns.find(
                        (r) => r.key === header.key
                      );
                      return (
                        <td
                          key={`result-${header.key}`}
                          className="px-4 py-2 border-2 border-t-0 border-l-0 last:border-r-0 border-blue-100/50 text-xs text-slate-600 font-medium text-center capitalize"
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
              className="h-9 bg-white border border-gray-300 text-sm rounded-md ms-0 focus:outline-none"
              value={perPage}
              defaultValue={10}
              onChange={(e) =>
                setPerPage(
                  Number(e.target.value) == 0 ? 10 : Number(e.target.value)
                )
              }
            >
              <option value="">Row Per Page</option>
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
                  className="flex items-center justify-center px-3 h-9 ms-0 leading-tight text-sm font-medium text-gray-700 
                  bg-white rounded-s-lg border border-gray-300 hover:bg-gray-100 hover:text-gray-700 capitalize cursor-pointer"
                  disabled={currentPage === 1}
                >
                  previous
                </button>
              </li>
              {pages.slice(0, 2).map((page) => (
                <li key={page}>
                  <button
                    onClick={() => handlePageChange(page)}
                    className={`flex items-center justify-center px-3 h-9 ms-0 leading-tight text-gray-500 
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
                  } border border-gray-300 text-center focus:outline-none`}
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
                    className={`flex items-center justify-center px-3 h-9 ms-0 leading-tight text-gray-500 
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
                  className="flex items-center justify-center px-3 h-9 ms-0 leading-tight text-sm font-medium text-gray-700 
                  bg-white rounded-e-lg border border-gray-300 hover:bg-gray-100 hover:text-gray-700 capitalize"
                  disabled={currentPage > pages.length}
                >
                  next
                </button>
              </li>
            </ul>
          </nav>
        )}
      </div>
    </div>
  );
};

export default Home;
