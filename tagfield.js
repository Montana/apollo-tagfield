import { useApolloClient } from "@redwoodjs/web";
import { useTheme } from "@chakra-ui/core";
import { useCallback, useState } from "react";
import AsyncSelect from "react-select/async-creatable"; // Can also use Axios for Promises. - Montana.

import { debounce } from "src/utils/debounce";

export const QUERY = gql`
  query FIND_TAGS_BY_LABEL($search: String!) {
    tags: tags(input: { where: { label: { contains: $search } } }) {
      id
      label
    }
  }
`;

export const TagField = ({ onChange, defaultValue, maxOptions = 3 }) => {
  const client = useApolloClient();
  const myTheme = useTheme();
  const [maxReached, setMaxReached] = useState(false);

  const debouncedSearch = useCallback(
    debounce(async (search, cb) => {
      if (maxReached) cb([]);

      try {
        const { data } = await client.query({
          query: QUERY,
          variables: { search },
        });
        cb(data.tags);
      } catch (e) {
        console.log("Error fetching tags", e);
      }
    }, 300),
    [client, maxReached]
  );

  const handleChange = useCallback(
    (values) => {
      onChange(values && values.map((value) => ({ label: value.label })));

      setMaxReached(!!values && values.length >= maxOptions);
    },
    [maxOptions, onChange]
  );

  const noOptionsMessage = useCallback(
    ({ inputValue }) =>
      maxReached
        ? `Maximum of ${maxOptions} tags.`
        : inputValue
        ? `No tags matching ${inputValue}`
        : "Start typing to search tags...",
    [maxOptions, maxReached]
  );

  return (
    <AsyncSelect
      styles={{
        menu: (base) => ({ ...base, background: myTheme.colors.gray[700] }),
      }}
      {...(maxReached && { options: [] })}
      defaultValue={defaultValue}
      isValidNewOption={(inputValue) => inputValue && !maxReached}
      isMulti
      isClearable
      cacheOptions={!maxReached}
      px={2}
      loadOptions={maxReached ? undefined : debouncedSearch}
      noOptionsMessage={noOptionsMessage}
      getOptionValue={(option) => option.label}
      onChange={handleChange}
      theme={(theme) => ({
        ...theme,
        colors: {
          ...theme.colors,
          primary0: myTheme.colors.teal[400],
          primary25: myTheme.colors.teal[300],
          primary50: myTheme.colors.teal[500],
          primary75: myTheme.colors.teal[700],
          neutral0: myTheme.colors.whiteAlpha[100],
          neutral5: myTheme.colors.teal[200],
          neutral10: myTheme.colors.teal[400],
          neutral20: myTheme.colors.whiteAlpha[50],
          neutral30: myTheme.colors.whiteAlpha[300],
          neutral40: myTheme.colors.whiteAlpha[400],
          neutral50: myTheme.colors.whiteAlpha[500],
          neutral60: myTheme.colors.whiteAlpha[600],
          neutral70: myTheme.colors.whiteAlpha[700],
          neutral80: myTheme.colors.whiteAlpha[800],
          neutral90: myTheme.colors.whiteAlpha[900],
        },
      })}
    />
  );
};
