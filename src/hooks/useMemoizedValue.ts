import { useRef, useEffect } from 'react';

/**
 * A hook that memoizes a value based on its dependencies.
 * This is useful for expensive computations that should only
 * be recalculated when their dependencies change.
 * 
 * @param compute Function that computes the value
 * @param deps Array of dependencies that trigger recomputation
 * @returns The memoized value
 */
function useMemoizedValue<T>(compute: () => T, deps: React.DependencyList): T {
  const ref = useRef<{ value: T; deps: React.DependencyList }>({
    value: compute(),
    deps
  });

  // Check if dependencies have changed
  const depsChanged = deps.length !== ref.current.deps.length ||
    deps.some((dep, i) => !Object.is(dep, ref.current.deps[i]));

  // If dependencies have changed, recompute the value
  if (depsChanged) {
    ref.current = {
      value: compute(),
      deps
    };
  }

  // Ensure the ref is updated if compute changes
  useEffect(() => {
    ref.current = {
      value: compute(),
      deps
    };
  }, [compute, ...deps]);

  return ref.current.value;
}

export default useMemoizedValue;
