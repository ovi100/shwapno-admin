"use client";
import Image from "next/image";
import { Button, Switch, Tab, Table } from "./components";
import { FiUser, FiSettings } from "react-icons/fi";
import { BiCheckCircle } from "react-icons/bi";
import { useEffect, useState } from "react";

export default function Home() {
  const [enabled, setEnabled] = useState(false);
  const [rows, setRows] = useState<object[]>([]);
  const perPage = 5;

  // Fetch initial data from dummyjson
  useEffect(() => {
    const fetchUsers = async (page = 1) => {
      const skip = (page - 1) * perPage;
      const response = await fetch(
        `https://dummyjson.com/users?limit=${perPage}&skip=${skip}&select=firstName,age,phone,bloodGroup,role`
      );
      const json = await response.json();
      setRows(json.users);
    };
    fetchUsers();
  }, []);

  // Optional: search API function
  const searchUsers = async (query: string) => {
    const res = await fetch(
      `https://dummyjson.com/users/search?q=${encodeURIComponent(query)}`
    );
    const json = await res.json();
    return json.users;
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
      <div className="data-table mt-10">
        <h1 className="text-2xl font-bold mb-4">User Data</h1>
        <Table
          rows={rows}
          // columns={columns}
          perPage={perPage}
          stickyColumnKeys={["firstName"]}
          searchable={true}
          searchApi={searchUsers}
        />
      </div>
    </div>
  );
}
