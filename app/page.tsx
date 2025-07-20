"use client";
import Image from "next/image";
import { Button, Switch, Tab, Table } from "./components";
import { FiUser, FiSettings } from "react-icons/fi";
import { BiCheckCircle } from "react-icons/bi";
import { useEffect, useMemo, useState } from "react";
import { IoSearchOutline } from "react-icons/io5";

export default function Home() {
  const [enabled, setEnabled] = useState<boolean>(false);
  const showAllCheck: boolean = false;
  const isCheckable: boolean = true;
  const calculateColumns: object[] = [
    { column: "id", calculate: "count" },
    { column: "age", calculate: "sum" },
    { column: "weight", calculate: "average" },
  ];
  const [rows, setRows] = useState<object[]>([]);
  const [checkedItems, setCheckedItems] = useState<object[]>([]);
  const [search, setSearch] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pages, setPages] = useState<number[]>([]);
  // const [jumpPage, setJumpPage] = useState<number>(1);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortAsc, setSortAsc] = useState<boolean>(true);
  const perPage = 10;

  const formatHeader = (key: string) =>
    key
      .replace(/_/g, " ")
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/\b\w/g, (char) => char.toUpperCase());

  // Fetch initial data from dummyjson
  const fetchUsers = async (page: number = 1) => {
    const skip = (page - 1) * perPage;
    const response = await fetch(
      `https://dummyjson.com/users?limit=${perPage}&skip=${skip}&select=firstName,age,role,gender,weight,bloodGroup`
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
  }, []);

  const handlePageChange = (page: number) => {
    fetchUsers(page);
    setCurrentPage(page);
  };

  // Optional: search API function
  const searchUsers = async (query: string) => {
    const res = await fetch(
      `https://dummyjson.com/users/search?q=${encodeURIComponent(query)}`
    );
    const json = await res.json();
    return json.users;
  };

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

  // Calculate column values if needed
  const calculatedColumns = useMemo(() => {
    const results = calculateColumns.map(({ column, calculate }) => {
      let value;

      switch (calculate) {
        case "count":
          value = sortedData.length;
          break;
        case "sum":
          value = sortedData.reduce(
            (sum, item) => sum + (item[column] || 0),
            0
          );
          break;
        case "average":
          const sum = sortedData.reduce(
            (total, item) => total + (item[column] || 0),
            0
          );
          value = sum / sortedData.length;
          break;
        default:
          value = null;
      }

      // Format the value to remove decimal places if it's an integer
      value = Number.isInteger(value) ? value.toString() : value.toFixed(2);

      return {
        key: column,
        operation: calculate,
        value: value,
      };
    });
    return results;
  }, [sortedData, calculateColumns]);

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
          theme="classic"
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

        <div className="search-box pb-4">
          <label htmlFor="table-search" className="sr-only">
            Search
          </label>
          <div className="relative mt-1">
            <div className="absolute inset-y-0 rtl:inset-r-0 start-0 flex items-center ps-3 pointer-events-none">
              <IoSearchOutline className="text-gray-500" />
            </div>
            <input
              type="text"
              id="table-search"
              className="block px-10 py-2 text-sm text-gray-900 border border-gray-300 rounded-md w-80 bg-gray-50 focus:ring-0 focus:border-blue-500"
              placeholder="Search for user"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="relative overflow-x-auto rounded-lg">
          <table className="w-full text-sm text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-white">
              <tr>
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
                          ? `${
                              columnItem.operation === "count"
                                ? "total = "
                                : columnItem.operation + " = "
                            } ${columnItem.value}`
                          : ""}
                      </td>
                    );
                  })}
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <nav
          className="flex items-center justify-end mt-5"
          aria-label="Table navigation"
        >
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
            {pages.slice(0, 3).map((page) => (
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
                className="w-9 px-1 h-9 bg-white border border-gray-300 text-center focus:outline-none"
                placeholder="..............."
                onChange={(e) => handlePageChange(Number(e.target.value))}
              />
            </div>
            {pages.slice(-3).map((page) => (
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
      </div>
    </div>
  );
}
