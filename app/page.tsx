"use client";
import Image from "next/image";
import { Button, Tab } from "./components";
import { FiUser, FiSettings } from "react-icons/fi";
import { BiCheckCircle } from "react-icons/bi";
// import { useState } from "react";

export default function Home() {
  // const [activeIndex, setActiveIndex] = useState(0);
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
      <div className="bg-gray-100 mt-5 p-8">
        <Tab
          tabs={tabs}
          theme="classic"
          variant="primary"
          type="horizontal"
          trackVisibility={false}
        />

        {/* <div className="tab flex flex-row mt-10">
          <div className="tab-header inline-flex items-center gap-3 border-b border-gray-300">
            {tabs.map((tab, index) => (
              <button
                key={index}
                className={`flex items-center gap-2 ${
                  index === activeIndex
                    ? "border-b-2 border-blue-600"
                    : "border-b-2 border-transparent"
                } px-4 py-2`}
                onClick={() => setActiveIndex(index)}
              >
                {tab.icon && <span>{tab.icon}</span>}
                <span
                  className={`${
                    index === activeIndex ? "text-blue-600" : "text-black"
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            ))}
          </div>
          <div className="mt-4 animate-fadeIn">
            {tabs[activeIndex]?.content}
          </div>
        </div> */}
      </div>
    </div>
  );
}
