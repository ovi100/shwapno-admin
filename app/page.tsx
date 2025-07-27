"use client";
import Image from "next/image";
import { Button, Switch, Tab, Table } from "./components";
import { FiUser, FiSettings } from "react-icons/fi";
import { BiCheckCircle } from "react-icons/bi";
import { useEffect, useState } from "react";
const API_URL = "https://dummyjson.com/users";

type User = {
  id: number;
  firstName: string;
  age: number;
  role: string;
  gender: string;
  weight: number;
  bloodGroup: string;
};

type operation = {
  key: string;
  operation: "min" | "unique" | "average" | "count" | "sum" | "max";
};

const Home = () => {
  const [enabled, setEnabled] = useState<boolean>(false);
  const [data, setData] = useState<object[]>([]);
  const [checkedItems, setCheckedItems] = useState<object[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [perPage, setPerPage] = useState<number>(10);
  const columnOperations: operation[] = [
    { key: "age", operation: "min" },
    { key: "role", operation: "unique" },
    { key: "gender", operation: "unique" },
    { key: "weight", operation: "average" },
    { key: "bloodGroup", operation: "unique" },
  ];

  const fetchUsers = async (page: number = 1) => {
    const skip = (page - 1) * perPage;
    const response = await fetch(
      API_URL +
        `?limit=${perPage}&skip=${skip}&select=firstName,age,role,gender,weight,bloodGroup`
    );
    const result = await response.json();
    const data = result.users;
    setTotalItems(result.total);
    setCurrentPage(page);
    setCheckedItems([]);
    setData(data);
  };
  useEffect(() => {
    fetchUsers();
  }, [perPage]);

  const searchUsers = async (query: string) => {
    try {
      if (query) {
        const response = await fetch(
          API_URL + `/search?q=${encodeURIComponent(query)}`
        );
        const result = await response.json();
        const data = result.users.map((user: User) => ({
          id: user.id,
          firstName: user.firstName,
          age: user.age,
          role: user.role,
          gender: user.gender,
          weight: user.weight,
          bloodGroup: user.bloodGroup,
        }));
        setData(data);
      }
    } catch (error) {
      console.error("Error searching users:", error);
    }
  };

  const headers = [
    { label: "Id", key: "id" },
    { label: "Name", key: "firstName" },
    { label: "Age", key: "age" },
    { label: "Role", key: "role" },
    { label: "Gender", key: "gender" },
    { label: "Weight", key: "weight" },
    { label: "Group", key: "bloodGroup" },
  ];

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

  console.log("checked items", checkedItems);

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
        <h1 className="text-2xl font-bold mb-4">User Data</h1>
        <Table
          data={data}
          headers={headers}
          totalItems={totalItems}
          currentPage={currentPage}
          stickyColumns={["age", "role"]}
          columnOperations={columnOperations}
          searchable={true}
          onSearch={searchUsers}
          onLimitChange={setPerPage}
          onPageChange={fetchUsers}
          isCheckable={true}
          exportable={true}
          onChecked={setCheckedItems}
        />
      </div>
    </div>
  );
};

export default Home;
