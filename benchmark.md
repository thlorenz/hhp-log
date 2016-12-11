## ServerSide

Note that times included parsing.

### LevelDown + LevelUp

- insert 21K hands:                   37.31 real         9.84 user         1.47 sys
- summary-log 21K hands:              1.45s

### LevelDown + HyperLog

- insert 21K hands:                   65.87 real        39.89 user         5.03 sys
- summary-log 21K hands:              2.51s

## LevelUp vs HyperLog Server Side Summary

- for server side storage hyperlog could be used with 100% overhead on inserts and 60% on reads to get features like
  eventual consistency if needed

## Client Side

Times don't include parsing.

### FruitDown + LevelUp

- insert 21K hands:     9.24e+04ms
- summary 21K hands:    4.66e+04ms

### FruitDown + HyperLog

- insert 21K hands:     6.59e+05ms
- summary 21K hands:    9.48e+04ms


## LevelUp vs HyperLog Client Side Summary

- insert with LevelUp takes 92.4 secs and with HyperLog 659 secs, thus HyperLog is **more than 7x slower** when inserting
  data
- insert with HyperLog seems to get slower and slower the more data has been added prior
- reading out all hands to get the summary takes 46.6 secs with LevelUp and with HyperLog 94.9 secs, thus HyperLog takes
  about 2x as long to read each entry
- HyperLog being slower is most likely due to the fact that it has to do 2 lookups, one find the key in the `nodes` log
  while LevelUp just looks up each value in one step
- the facit is that for simple browser storage without worrying about consistency (assuming one user importing hands
  synchronously) levelup should be used

## Other Client Side leveldown Implementations

I got level-js working with hyperlog but it was even slower than with fruitdown. I couldn't get it working with levelup
directly, see further down for mor info.

localstorage-down did enter a good amount of values, but then ended up crashing no matter if used with hyperlog or
levelup due to exceeding the local storage limit.

### Level-JS + LevelUp

- insert fails with

```
Uncaught DOMException: Failed to execute 'put' on 'IDBObjectStore': The object store uses in-line keys and the key parameter was provided.
    at IDBStore.put (http://localhost:9966/client.js:20460:73)
    at Level._put (http://localhost:9966/client.js:19351:12)
    at Level.AbstractLevelDOWN.put (http://localhost:9966/client.js:19763:17)
    at LevelUP.put (http://localhost:9966/client.js:22047:11)
    at LevelUp.append (http://localhost:9966/client.js:87:14)
    at ParsedHandsLog._append (http://localhost:9966/client.js:207:17)
    at setTimeout (http://localhost:9966/client.js:193:57)
```

### LocalStorage Down + LevelUp

- insert fails with the below message showing that we very quickly exceed our default localstorage limit
- thus we'd be required to do some annoying popup to get the user to opt in for more

```
DOMException: Failed to execute 'setItem' on 'Storage': Setting the value of 'pokertell:parsed!pokerstars:14368612775' exceeded the quota.
    at http://localhost:9966/client.js:25728:13
    at callbackify (http://localhost:9966/client.js:25690:11)
    at LocalStorageCore.put (http://localhost:9966/client.js:25727:3)
    at Object.fun (http://localhost:9966/client.js:25830:17)
    at http://localhost:9966/client.js:25929:10
    at Item.run (http://localhost:9966/client.js:49794:14)
    at drainQueue (http://localhost:9966/client.js:49764:42)message: "Failed to execute 'setItem' on 'Storage': Setting the value of 'pokertell:parsed!pokerstars:14368612775' exceeded the quota."name: "WriteError"stack: "WriteError: Failed to execute 'setItem' on 'Storage': Setting the value of 'pokertell:parsed!pokerstars:14368612775' exceeded the quota.↵    at http://localhost:9966/client.js:22049:34↵    at http://localhost:9966/client.js:25930:21↵    at http://localhost:9966/client.js:26377:18↵    at http://localhost:9966/client.js:25695:5↵    at Item.run (http://localhost:9966/client.js:49794:14)↵    at drainQueue (http://localhost:9966/client.js:49764:42)"type: "WriteError"__proto__: ErrorEventEmitter.emit @ client.js:52676
client.js:28608 err(anonymous function) @ client.js:28608
```
