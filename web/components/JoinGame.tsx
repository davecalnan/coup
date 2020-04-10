import React, { useState, FormEvent } from "react";

import { Card } from "./";

export type JoinGameProps = {
  chooseName: (name: string) => void;
};

export const JoinGame = ({ chooseName }: JoinGameProps) => {
  const [name, setName] = useState<string>("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    chooseName(name);
  };

  return (
    <main className="h-full flex flex-col justify-center items-center">
      <Card>
        <form onSubmit={handleSubmit}>
          <label htmlFor="name" className="block">
            What's your name?
          </label>
          <input
            name="name"
            value={name}
            onChange={event => setName(event.target.value)}
            className="border"
          />
          <button type="submit">Send</button>
        </form>
      </Card>
    </main>
  );
};
