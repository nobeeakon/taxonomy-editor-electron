import { Form } from "react-router-dom";

import { useTaxonomyContext } from "../Taxonomy";

export const searchTextQueryParam = "searchText" as const;

const SeachForm = () => {
  const { context } = useTaxonomyContext();

  return (
    <Form method="get" action={`/${context.taxonomy}/search`}>
      <label htmlFor="search-input">Search</label>
      <input id="search-input" type="text" name={searchTextQueryParam} />
      <button type="submit">Go!!</button>
    </Form>
  );
};

export default SeachForm;
