import React from "react";


export function useSessionStorage(localStorageKey, defaultValue) {
    const [value, setValue] = React.useState(
      sessionStorage.getItem(localStorageKey) || defaultValue
    );
  
    React.useEffect(() => {
      sessionStorage.setItem(localStorageKey, value);
    }, [localStorageKey, value]);
  
    return [value, setValue];
}