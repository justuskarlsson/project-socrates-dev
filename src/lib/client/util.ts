export function createLoadingPromise(loader: () => Promise<any>) {
  const resolver: { resolve?: () => void } = {};
  
  const loadingPromise = new Promise<void>((resolve) => {
    resolver.resolve = resolve;
  });

  loader().then(() => {
    resolver.resolve!();
  });

  return loadingPromise;
}


export function updateArrayItem(values: any[], item: any) {
  return [
    ...values.filter(f => f.id !== item.id),
    item
  ];
}