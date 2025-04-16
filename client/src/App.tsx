import { useEffect, useState } from 'react';
import { AppType } from '../../server/index';
import { hc, InferResponseType } from 'hono/client';

const client = hc<AppType>('/');

// type Book = {
//   id: number;
//   title: string;
//   author: string;
// };

function App() {
  const [books, setBooks] = useState<
    InferResponseType<typeof client.api.books.$get>
  >([]);
  const [counter, setCounter] = useState(0);

  useEffect(() => {
    const fetchBooks = async () => {
      // const resp = await fetch('/api/books');
      // const data = await resp.json();
      const resp = await client.api.books.$get();
      const data = await resp.json();
      setBooks(data);
    };
    fetchBooks();
  }, []);

  return (
    <div className="p-20">
      <h1 className="flex justify-center text-4xl m-4">Book List</h1>
      <ul className="list bg-base-200 rounded-box shadow-md">
        {books.map((book) => (
          <li key={book.id} className="list-row">
            {book.title} by {book.author}
          </li>
        ))}
      </ul>
      <div className="flex justify-end">
        <button
          className="btn btn-primary mt-4"
          onClick={() => setCounter((prev) => prev + 1)}
        >
          Click me! {counter}
        </button>
      </div>
    </div>
  );
}

export default App;
