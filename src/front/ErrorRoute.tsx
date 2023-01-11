import { Link } from "react-router-dom";

const ErrorRoute = () => {
  return (
    <div>
      <h1>Something went wrong :( </h1>
      <div>
        <Link to={`/`}> Home</Link>
      </div>
    </div>
  );
};

export default ErrorRoute;
