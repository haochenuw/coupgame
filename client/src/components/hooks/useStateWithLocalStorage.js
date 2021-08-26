import React from "react";

export function useStateWithLocalStorage(localStorageKey, defaultValue) {
    const [value, setValue] = React.useState(
      JSON.parse(localStorage.getItem(localStorageKey)) || defaultValue
    );
  
    React.useEffect(() => {
      localStorage.setItem(localStorageKey, JSON.stringify(value));
    }, [value]);
  
    return [value, setValue];
};