import { useCallback, useEffect, useRef } from "react";

const debounceImpl = (cb: (...args: unknown[]) => unknown, delay: number) => {
  let isDebounced: NodeJS.Timeout | null = null;

  return (...args: unknown[]) => {
    if (isDebounced) {
      clearTimeout(isDebounced);
    }

    isDebounced = setTimeout(() => cb(...args), delay);
  };
};

export function useDebounce(
  cb: (...args: unknown[]) => unknown,
  delay: number
) {
  const cbRef = useRef(cb);

  useEffect(() => {
    cbRef.current = cb;
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useCallback(
    debounceImpl((...args) => cbRef.current(...args), delay),
    [delay]
  );
}
