import { type IDBPDatabase, openDB } from 'idb';
import { useCallback } from 'react';
import useSWR, { type SWRConfiguration, useSWRConfig } from 'swr';

interface UseIndexedDBConfig {
  version?: number;
  storeNamesToLoad?: string[];
  swrConfig?: SWRConfiguration;
}

const globalDBCache = new Map<string, Promise<IDBPDatabase>>();

const openIndexedDB = async (
  name: string,
  version: number = 2,
  storeNames: string[] = ['keyvaluepairs'],
): Promise<IDBPDatabase> => {
  const dbKey = `${name}:${version}`;

  if (!globalDBCache.has(dbKey)) {
    const db = openDB(name, version, {
      upgrade(d) {
        storeNames.forEach(storeName => {
          if (!d.objectStoreNames.contains(storeName)) {
            d.createObjectStore(storeName);
          }
        });
      },
    });
    globalDBCache.set(dbKey, db);
  }

  return globalDBCache.get(dbKey)!;
};

const generateIndexedDBKey = (
  name: string,
  storeName: string,
  operation: string,
  customKey?: string,
) => `idb:${name}:${storeName}:${operation}:${customKey}`;

export const useIndexedDBItem = <T = any>(
  name: string,
  storeName: string,
  key: string,
  config: UseIndexedDBConfig = {},
) => {
  const {
    version = 1,
    storeNamesToLoad = [storeName],
    swrConfig,
  } = config;

  return useSWR(
    generateIndexedDBKey(name, storeName, 'get', key),
    async () => {
      const db = await openIndexedDB(name, version, storeNamesToLoad);
      return await db.get(storeName, key) as T | undefined;
    },
    swrConfig,
  );
};

// eslint-disable-next-line ts/no-unnecessary-type-parameters
export const useIndexedDBMutations = <T = any>(
  name: string,
  storeName: string,
  config: UseIndexedDBConfig = {},
) => {
  const {
    version = 1,
    storeNamesToLoad = [storeName],
  } = config;
  const { mutate } = useSWRConfig();

  const set = useCallback(async (key: string, value: T) => {
    const itemKey = generateIndexedDBKey(name, storeName, 'get', key);

    try {
      await mutate(itemKey, value, false);
      const db = await openIndexedDB(name, version, storeNamesToLoad);
      await db.put(storeName, value, key);
      await mutate(itemKey);
    } catch (error) {
      await mutate(itemKey);
      throw error;
    }
  }, [name, storeName, version, storeNamesToLoad, mutate]);

  const remove = useCallback(async (key: string) => {
    const itemKey = generateIndexedDBKey(name, storeName, 'get', key);

    try {
      await mutate(itemKey, undefined, false);
      const db = await openIndexedDB(name, version, storeNamesToLoad);
      await db.delete(storeName, key);
      await mutate(itemKey);
    } catch (error) {
      await mutate(itemKey);
      throw error;
    }
  }, [name, storeName, version, storeNamesToLoad, mutate]);

  return { set, remove };
};

export const useIndexedDB = <T = any>(
  name: string,
  storeName: string = 'keyvaluepairs',
  config: UseIndexedDBConfig = {},
) => {
  const mutations = useIndexedDBMutations<T>(name, storeName, config);

  return {
    ...mutations,
    useItem: (key: string) => useIndexedDBItem<T>(name, storeName, key, config),
  };
};

export const useIndexedDBCache = (
  name: string,
  storeName: string = 'keyvaluepairs',
) => {
  const { mutate } = useSWRConfig();
  return useCallback(
    (key: string) => mutate(generateIndexedDBKey(name, storeName, 'get', key)),
    [name, storeName, mutate],
  );
};
