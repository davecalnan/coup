import { useState, FormEvent } from "react";
import Router from "next/router";

import { Layout, Card } from "../components";

const Homepage = () => {
  const [roomCode, setRoomCode] = useState<string>("");
  const [name, setName] = useState<string>("");

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    window.localStorage.setItem("name", name);

    Router.push(`/rooms/${roomCode}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl leading-9 font-extrabold text-gray-900">
          Join a room
        </h2>
        <p className="mt-2 text-center text-sm leading-5 text-gray-600 max-w">
          Or{" "}
          <a
            href="#"
            className="font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:underline transition ease-in-out duration-150"
          >
            create your own
          </a>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="roomCode"
                className="block text-sm font-medium leading-5 text-gray-700"
              >
                Room Code
              </label>
              <div className="mt-1 rounded-md shadow-sm">
                <input
                  id="roomCode"
                  type="text"
                  required
                  pattern="[a-zA-Z]{4}"
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 uppercase focus:outline-none focus:shadow-outline-blue focus:border-blue-300 transition duration-150 ease-in-out sm:text-sm sm:leading-5"
                  value={roomCode}
                  onChange={(event) => setRoomCode(event.target.value)}
                />
              </div>
            </div>

            <div className="mt-6">
              <label
                htmlFor="name"
                className="block text-sm font-medium leading-5 text-gray-700"
              >
                Your Name
              </label>
              <div className="mt-1 rounded-md shadow-sm">
                <input
                  id="name"
                  type="name"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:shadow-outline-blue focus:border-blue-300 transition duration-150 ease-in-out sm:text-sm sm:leading-5"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
              </div>
            </div>

            <div className="mt-6">
              <span className="block w-full rounded-md shadow-sm">
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:border-indigo-700 focus:shadow-outline-indigo active:bg-indigo-700 transition duration-150 ease-in-out"
                >
                  Join room
                </button>
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Homepage;
