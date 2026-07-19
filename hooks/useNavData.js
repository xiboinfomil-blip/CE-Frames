// hooks/useNavData.js
// import { useImageCategories } from './useImageCategories';
// import { useAnotherApiHook } from './useAnotherApiHook'; // Add future hooks here

export function useNavData(authenticated) {
  // 1. Dummy data for now (Replace with actual hook calls later)
  // Note: The structure must include the `dataKey` ('imagesFor'), `loading`, and `error` 
  // to match what the Navbar's `getItemData` helper expects.
  const imageCategories = {
    imagesFor: ['Formula 1', 'MotoGP', 'WEC', 'WRC', 'Drift'],
    loading: false,
    error: null,
  };

  // Example of how another data source would look:
  // const anotherApiData = {
  //   categories: ['Category A', 'Category B'],
  //   loading: false,
  //   error: null,
  // };

  // 2. Return an object mapping the data to string keys.
  // These keys MUST match the `dataSource` property in your navbar config.
  return {
    imageCategories,
    // anotherSource: anotherApiData
  };
}