import React from "react";

export function useStateWithSessionStorage(localStorageKey, defaultValue) {
    const [value, setValue] = React.useState(
      JSON.parse(sessionStorage.getItem(localStorageKey)) || defaultValue
    );
  
    React.useEffect(() => {
      sessionStorage.setItem(localStorageKey, JSON.stringify(value));
    }, [value]);
  
    return [value, setValue];
};