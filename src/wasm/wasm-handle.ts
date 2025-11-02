import {int, nonnull} from '../base.js';

/**
 * WasmHandle - manages allocations for passing data between JS and WASM
 * Original location: engine.ts lines 792-822
 *
 * Provides handle-based memory management for WASM interop.
 * Handles are integer indices into an array of values.
 */

export class WasmHandle<T> {
  entries: (T | null)[];
  freeList: int[];

  constructor() {
    this.entries = [];
    this.freeList = [];
  }

  allocate(value: T): int {
    const free = this.freeList.pop();
    if (free !== undefined) {
      this.entries[free] = value;
      return free;
    }
    const result = int(this.entries.length);
    this.entries.push(value);
    return result;
  }

  free(index: int): T {
    const value = nonnull(this.entries[index]);
    this.entries[index] = null;
    this.freeList.push(index);
    return value;
  }

  get(index: int): T {
    return nonnull(this.entries[index]);
  }
};
