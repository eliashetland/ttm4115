import { useExample } from "./useExample";

export const Example = () => {
  const { query } = useExample();



  return (
    <div>
      <h1>Example</h1>
      <ul>
        {query.data?.map((example) => (
          <li key={example.id}>
            <h2>{example.name}</h2>
            <p>{example.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};
