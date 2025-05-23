This issue was resolved on 1.3.0-alpha.21.
https://github.com/duckdb/duckdb-node-neo/issues/220

---

# DuckDB Node.js API Segmentation Fault Reproduction

This repository demonstrates a segmentation fault issue in `@duckdb/node-api` version 1.2.2-alpha.19 when using the `list_cosine_similarity` function.

## Repository Structure

- `/alpha18`: Contains code using `@duckdb/node-api@1.2.2-alpha.18` (working version)
- `/alpha19`: Contains code using `@duckdb/node-api@1.2.2-alpha.19` (failing version with segmentation fault)
- `/data.duckdb`: Shared database file with sample embeddings data

## Reproduction Steps

1. Install dependencies for both versions:
   ```
   cd alpha18 && npm install
   cd ../alpha19 && npm install
   ```

2. Generate test data (only needed if `data.duckdb` doesn't exist):
   ```
   cd alpha18 && node generate.mjs
   ```

3. Reproduce the issue:
   ```
   # Working version (alpha.18)
   cd alpha18 && node index.mjs  # This works correctly

   # Failing version (alpha.19)
   cd alpha19 && node index.mjs  # This causes segmentation fault
   ```

## Issue Description

When using `list_cosine_similarity` function with `@duckdb/node-api@1.2.2-alpha.19`, the application crashes with a segmentation fault. The same code works correctly with version 1.2.2-alpha.18.

### Error Messages

On macOS (darwin-arm64, Node.js v20.12.2):
```
[1]    91808 segmentation fault  node index.mjs
```

Or sometimes:
```
node:internal/process/promises:289
        triggerUncaughtException(err, true /* fromPromise */);
    ^

[Error: Failed to execute prepared statement]

Node.js v20.12.2
```

On Linux (x86_64, Node.js v22.15.1, Linux 6.6.87+):
```
Segmentation fault (core dumped)
```

GDB stacktrace shows the crash happens in `___pthread_mutex_lock` during the execution of `list_cosine_similarity` query:
```
Thread 11 "node" received signal SIGSEGV, Segmentation fault.
___pthread_mutex_lock (mutex=0x7ff84ffb6e3b) at ./nptl/pthread_mutex_lock.c:80

#0  ___pthread_mutex_lock (mutex=0x7ff84ffb6e3b) at ./nptl/pthread_mutex_lock.c:80
#1  0x00007fffbe57ddd1 in duckdb::ClientContext::LockContext() ()
#2  0x00007fffbe5aed9a in duckdb::ClientContext::PendingQuery()
#3  0x00007fffbe5aef46 in duckdb::PreparedStatement::PendingQuery()
#4  0x00007fffbe5aefe9 in duckdb::PreparedStatement::Execute()
#5  0x00007fffbe4e1778 in duckdb_execute_prepared ()
```

The complete GDB log is available in the `gdb.log` file.

## Test Code

Both alpha18 and alpha19 directories contain identical code that:
1. Creates a table with vector embeddings (768-dimension)
2. Runs a query using `list_cosine_similarity` to find the most similar vector
3. The only difference is the version of `@duckdb/node-api` being used

The issue appears to be specific to the `list_cosine_similarity` function in version 1.2.2-alpha.19.
