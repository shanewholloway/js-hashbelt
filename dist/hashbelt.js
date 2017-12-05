'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

class BasicHashbeltMap {
  // BasicHashbeltMap
  //   options: @{}
  //     create  --  function that returns a Map-compatible object,
  //                 implementing has(), get(), set(), delete(), entries(), and clear()
  //     tip     --  initial Map-compatible object to use as the tip

  constructor(opts) {
    if (null == opts) {
      opts = {};
    } else if ('function' === typeof opts) {
      opts = { create: opts };
    }

    const createTip = 'function' === typeof opts.create ? opts.create.bind(opts) : () => new Map();

    const tip = null != opts.tip ? opts.tip : createTip();

    Object.defineProperties(this, {
      _createTip: { value: createTip },
      _belt: { writable: true, value: [tip] },
      _tid: { writable: true, value: null } });
  }

  setAutoRotateInterval(ms_delay) {
    if (this._tid) {
      clearInterval(this._tid);
    }
    if (null != ms_delay) {
      const tid = setInterval(() => this.rotate(), ms_delay);
      if (tid.unref) {
        tid.unref();
      }
      this._tid = tid;
    }
    return this;
  }

  rotate() {
    this._belt = this._cull_hashbelt([this._createTip()].concat(this._belt));
    return this;
  }

  _cull_hashbelt(belt) {
    return belt;
  }

  has(key) {
    for (const each of this._belt) {
      if (each.has(key)) {
        this._hit_has(key, each);
        return true;
      }
    }

    return !!this._miss_has(key);
  }

  _hit_has(key, coll) {}
  _miss_has(key) {}

  get(key) {
    for (const each of this._belt) {
      if (each.has(key)) {
        const value = each.get(key);
        this._hit_get(key, value, each);
        return value;
      }
    }
    return this._miss_get(key);
  }

  _hit_get(key, value, coll) {}
  _miss_get(key) {}

  set(key, value) {
    const tip = this._belt[0];
    this._hit_set(key, value, tip);
    tip.set(key, value);
    return this;
  }

  _hit_set(key, value, coll) {}

  delete(key) {
    for (const each of this._belt) {
      if (each.has(key)) {
        this._hit_delete(key, each);
        return each.delete(key);
      }
    }

    return !!this._miss_delete(key);
  }

  _hit_delete(key, coll) {}
  _miss_delete(key) {}

  clear() {
    const previous = this._belt;
    this._belt = [new this._createTip()];

    if (previous) {
      for (const each of previous) {
        each.clear();
      }
    }
  }

  *entries() {
    const seen = new Set();
    let sz = seen.size;

    for (const each of this._belt) {
      for (const entry of each.entries()) {
        seen.add(entry[0]);
        if (sz !== seen.size) {
          sz = seen.size;
          yield entry;
        }
      }
    }
  }

  [Symbol.iterator]() {
    return this.entries();
  }
  *keys() {
    for (const entry of this.entries()) {
      yield entry[0];
    }
  }
  *values() {
    for (const entry of this.entries()) {
      yield entry[1];
    }
  }
  forEach(callback, thisArg) {
    return new Map(this.entries()).forEach(callback, thisArg);
  }
}

class HashbeltMap extends BasicHashbeltMap {
  constructor(opts) {
    if (null == opts) {
      opts = {};
    }
    super(opts);
    Object.defineProperties(this, {
      capacity: { value: opts.capacity || 5 } });
  }

  _cull_hashbelt(belt) {
    const capacity = this.capacity;
    if (null != capacity && capacity < belt.length) {
      const trim = belt.slice(capacity);
      belt = belt.slice(0, capacity);
      this._trim(trim, belt);
    }
    return belt;
  }
  _trim(belt_trunc) {}

  autoRotate(ms_delay = 60000) {
    return this.setAutoRotateInterval(ms_delay);
  }
}

const Hashbelt = HashbeltMap;

class ReadCachingHashbeltMap extends HashbeltMap {
  _hit_get(key, value, coll) {
    // copy the hit to the front of the cache
    const tip = this._belt[0];
    tip.set(key, value);
  }
}

const CachingHashbeltMap = ReadCachingHashbeltMap;
const CachingHashbelt = ReadCachingHashbeltMap;

function createCachingHashbelt(opts) {
  return new ReadCachingHashbeltMap(opts);
}

exports.BasicHashbeltMap = BasicHashbeltMap;
exports.HashbeltMap = HashbeltMap;
exports.Hashbelt = Hashbelt;
exports.ReadCachingHashbeltMap = ReadCachingHashbeltMap;
exports.CachingHashbeltMap = CachingHashbeltMap;
exports.CachingHashbelt = CachingHashbelt;
exports['default'] = createCachingHashbelt;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGFzaGJlbHQuanMiLCJzb3VyY2VzIjpbIi4uL2NvZGUvaW5kZXguanN5Il0sInNvdXJjZXNDb250ZW50IjpbIlxuZXhwb3J0IGNsYXNzIEJhc2ljSGFzaGJlbHRNYXAgOjpcbiAgLy8gQmFzaWNIYXNoYmVsdE1hcFxuICAvLyAgIG9wdGlvbnM6IEB7fVxuICAvLyAgICAgY3JlYXRlICAtLSAgZnVuY3Rpb24gdGhhdCByZXR1cm5zIGEgTWFwLWNvbXBhdGlibGUgb2JqZWN0LFxuICAvLyAgICAgICAgICAgICAgICAgaW1wbGVtZW50aW5nIGhhcygpLCBnZXQoKSwgc2V0KCksIGRlbGV0ZSgpLCBlbnRyaWVzKCksIGFuZCBjbGVhcigpXG4gIC8vICAgICB0aXAgICAgIC0tICBpbml0aWFsIE1hcC1jb21wYXRpYmxlIG9iamVjdCB0byB1c2UgYXMgdGhlIHRpcFxuXG4gIGNvbnN0cnVjdG9yKG9wdHMpIDo6XG4gICAgaWYgbnVsbCA9PSBvcHRzIDo6IG9wdHMgPSB7fVxuICAgIGVsc2UgaWYgJ2Z1bmN0aW9uJyA9PT0gdHlwZW9mIG9wdHMgOjpcbiAgICAgIG9wdHMgPSBAOiBjcmVhdGU6IG9wdHNcblxuICAgIGNvbnN0IGNyZWF0ZVRpcCA9ICdmdW5jdGlvbicgPT09IHR5cGVvZiBvcHRzLmNyZWF0ZVxuICAgICAgPyBvcHRzLmNyZWF0ZS5iaW5kKG9wdHMpXG4gICAgICA6ICgpID0+IG5ldyBNYXAoKVxuXG4gICAgY29uc3QgdGlwID0gbnVsbCAhPSBvcHRzLnRpcFxuICAgICAgPyBvcHRzLnRpcCA6IGNyZWF0ZVRpcCgpXG5cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydGllcyBAIHRoaXMsIEA6XG4gICAgICBfY3JlYXRlVGlwOiBAOiB2YWx1ZTogY3JlYXRlVGlwXG4gICAgICBfYmVsdDogQDogd3JpdGFibGU6IHRydWUsIHZhbHVlOiBbdGlwXVxuICAgICAgX3RpZDogQDogd3JpdGFibGU6IHRydWUsIHZhbHVlOiBudWxsXG5cblxuICBzZXRBdXRvUm90YXRlSW50ZXJ2YWwobXNfZGVsYXkpIDo6XG4gICAgaWYgdGhpcy5fdGlkIDo6IGNsZWFySW50ZXJ2YWwodGhpcy5fdGlkKVxuICAgIGlmIG51bGwgIT0gbXNfZGVsYXkgOjpcbiAgICAgIGNvbnN0IHRpZCA9IHNldEludGVydmFsIEAgKCkgPT4gdGhpcy5yb3RhdGUoKSwgbXNfZGVsYXlcbiAgICAgIGlmIHRpZC51bnJlZiA6OiB0aWQudW5yZWYoKVxuICAgICAgdGhpcy5fdGlkID0gdGlkXG4gICAgcmV0dXJuIHRoaXNcblxuICByb3RhdGUoKSA6OlxuICAgIHRoaXMuX2JlbHQgPSB0aGlzLl9jdWxsX2hhc2hiZWx0IEBcbiAgICAgIFt0aGlzLl9jcmVhdGVUaXAoKV1cbiAgICAgICAgLmNvbmNhdCBAIHRoaXMuX2JlbHRcbiAgICByZXR1cm4gdGhpc1xuXG4gIF9jdWxsX2hhc2hiZWx0KGJlbHQpIDo6IHJldHVybiBiZWx0XG5cblxuXG4gIGhhcyhrZXkpIDo6XG4gICAgZm9yIGNvbnN0IGVhY2ggb2YgdGhpcy5fYmVsdCA6OlxuICAgICAgaWYgZWFjaC5oYXMoa2V5KSA6OlxuICAgICAgICB0aGlzLl9oaXRfaGFzKGtleSwgZWFjaClcbiAgICAgICAgcmV0dXJuIHRydWVcblxuICAgIHJldHVybiAhISB0aGlzLl9taXNzX2hhcyhrZXkpXG5cbiAgX2hpdF9oYXMoa2V5LCBjb2xsKSA6OlxuICBfbWlzc19oYXMoa2V5KSA6OlxuXG5cbiAgZ2V0KGtleSkgOjpcbiAgICBmb3IgY29uc3QgZWFjaCBvZiB0aGlzLl9iZWx0IDo6XG4gICAgICBpZiBlYWNoLmhhcyhrZXkpIDo6XG4gICAgICAgIGNvbnN0IHZhbHVlID0gZWFjaC5nZXQoa2V5KVxuICAgICAgICB0aGlzLl9oaXRfZ2V0KGtleSwgdmFsdWUsIGVhY2gpXG4gICAgICAgIHJldHVybiB2YWx1ZVxuICAgIHJldHVybiB0aGlzLl9taXNzX2dldChrZXkpXG5cbiAgX2hpdF9nZXQoa2V5LCB2YWx1ZSwgY29sbCkgOjpcbiAgX21pc3NfZ2V0KGtleSkgOjpcblxuXG4gIHNldChrZXksIHZhbHVlKSA6OlxuICAgIGNvbnN0IHRpcCA9IHRoaXMuX2JlbHRbMF1cbiAgICB0aGlzLl9oaXRfc2V0KGtleSwgdmFsdWUsIHRpcClcbiAgICB0aXAuc2V0KGtleSwgdmFsdWUpXG4gICAgcmV0dXJuIHRoaXNcblxuICBfaGl0X3NldChrZXksIHZhbHVlLCBjb2xsKSA6OlxuXG5cbiAgZGVsZXRlKGtleSkgOjpcbiAgICBmb3IgY29uc3QgZWFjaCBvZiB0aGlzLl9iZWx0IDo6XG4gICAgICBpZiBlYWNoLmhhcyhrZXkpIDo6XG4gICAgICAgIHRoaXMuX2hpdF9kZWxldGUoa2V5LCBlYWNoKVxuICAgICAgICByZXR1cm4gZWFjaC5kZWxldGUoa2V5KVxuXG4gICAgcmV0dXJuICEhIHRoaXMuX21pc3NfZGVsZXRlKGtleSlcblxuICBfaGl0X2RlbGV0ZShrZXksIGNvbGwpIDo6XG4gIF9taXNzX2RlbGV0ZShrZXkpIDo6XG5cblxuXG4gIGNsZWFyKCkgOjpcbiAgICBjb25zdCBwcmV2aW91cyA9IHRoaXMuX2JlbHRcbiAgICB0aGlzLl9iZWx0ID0gW25ldyB0aGlzLl9jcmVhdGVUaXAoKV1cblxuICAgIGlmIHByZXZpb3VzIDo6XG4gICAgICBmb3IgY29uc3QgZWFjaCBvZiBwcmV2aW91cyA6OlxuICAgICAgICBlYWNoLmNsZWFyKClcblxuXG4gICplbnRyaWVzKCkgOjpcbiAgICBjb25zdCBzZWVuID0gbmV3IFNldCgpXG4gICAgbGV0IHN6ID0gc2Vlbi5zaXplXG5cbiAgICBmb3IgY29uc3QgZWFjaCBvZiB0aGlzLl9iZWx0IDo6XG4gICAgICBmb3IgY29uc3QgZW50cnkgb2YgZWFjaC5lbnRyaWVzKCkgOjpcbiAgICAgICAgc2Vlbi5hZGQoZW50cnlbMF0pXG4gICAgICAgIGlmIHN6ICE9PSBzZWVuLnNpemUgOjpcbiAgICAgICAgICBzeiA9IHNlZW4uc2l6ZVxuICAgICAgICAgIHlpZWxkIGVudHJ5XG5cbiAgW1N5bWJvbC5pdGVyYXRvcl0oKSA6OlxuICAgIHJldHVybiB0aGlzLmVudHJpZXMoKVxuICAqa2V5cygpIDo6XG4gICAgZm9yIGNvbnN0IGVudHJ5IG9mIHRoaXMuZW50cmllcygpIDo6XG4gICAgICB5aWVsZCBlbnRyeVswXVxuICAqdmFsdWVzKCkgOjpcbiAgICBmb3IgY29uc3QgZW50cnkgb2YgdGhpcy5lbnRyaWVzKCkgOjpcbiAgICAgIHlpZWxkIGVudHJ5WzFdXG4gIGZvckVhY2goY2FsbGJhY2ssIHRoaXNBcmcpIDo6XG4gICAgcmV0dXJuIG5ldyBNYXAodGhpcy5lbnRyaWVzKCkpLmZvckVhY2goY2FsbGJhY2ssIHRoaXNBcmcpXG5cblxuXG5leHBvcnQgY2xhc3MgSGFzaGJlbHRNYXAgZXh0ZW5kcyBCYXNpY0hhc2hiZWx0TWFwIDo6XG4gIGNvbnN0cnVjdG9yKG9wdHMpIDo6XG4gICAgaWYgbnVsbCA9PSBvcHRzIDo6IG9wdHMgPSB7fVxuICAgIHN1cGVyKG9wdHMpXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnRpZXMgQCB0aGlzLCBAOlxuICAgICAgICBjYXBhY2l0eTogQDogdmFsdWU6IG9wdHMuY2FwYWNpdHkgfHwgNVxuXG4gIF9jdWxsX2hhc2hiZWx0KGJlbHQpIDo6XG4gICAgY29uc3QgY2FwYWNpdHkgPSB0aGlzLmNhcGFjaXR5XG4gICAgaWYgbnVsbCAhPSBjYXBhY2l0eSAmJiBjYXBhY2l0eSA8IGJlbHQubGVuZ3RoIDo6XG4gICAgICBjb25zdCB0cmltID0gYmVsdC5zbGljZShjYXBhY2l0eSlcbiAgICAgIGJlbHQgPSBiZWx0LnNsaWNlKDAsIGNhcGFjaXR5KVxuICAgICAgdGhpcy5fdHJpbSBAIHRyaW0sIGJlbHRcbiAgICByZXR1cm4gYmVsdFxuICBfdHJpbShiZWx0X3RydW5jKSA6OlxuXG4gIGF1dG9Sb3RhdGUobXNfZGVsYXk9NjAwMDApIDo6XG4gICAgcmV0dXJuIHRoaXMuc2V0QXV0b1JvdGF0ZUludGVydmFsKG1zX2RlbGF5KVxuXG5leHBvcnQgY29uc3QgSGFzaGJlbHQgPSBIYXNoYmVsdE1hcFxuXG5cblxuZXhwb3J0IGNsYXNzIFJlYWRDYWNoaW5nSGFzaGJlbHRNYXAgZXh0ZW5kcyBIYXNoYmVsdE1hcCA6OlxuICBfaGl0X2dldChrZXksIHZhbHVlLCBjb2xsKSA6OlxuICAgIC8vIGNvcHkgdGhlIGhpdCB0byB0aGUgZnJvbnQgb2YgdGhlIGNhY2hlXG4gICAgY29uc3QgdGlwID0gdGhpcy5fYmVsdFswXVxuICAgIHRpcC5zZXQoa2V5LCB2YWx1ZSlcblxuZXhwb3J0IGNvbnN0IENhY2hpbmdIYXNoYmVsdE1hcCA9IFJlYWRDYWNoaW5nSGFzaGJlbHRNYXBcbmV4cG9ydCBjb25zdCBDYWNoaW5nSGFzaGJlbHQgPSBSZWFkQ2FjaGluZ0hhc2hiZWx0TWFwXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGNyZWF0ZUNhY2hpbmdIYXNoYmVsdChvcHRzKSA6OlxuICByZXR1cm4gbmV3IFJlYWRDYWNoaW5nSGFzaGJlbHRNYXAgQCBvcHRzXG5cbiJdLCJuYW1lcyI6WyJCYXNpY0hhc2hiZWx0TWFwIiwib3B0cyIsImNyZWF0ZSIsImNyZWF0ZVRpcCIsImJpbmQiLCJNYXAiLCJ0aXAiLCJkZWZpbmVQcm9wZXJ0aWVzIiwidmFsdWUiLCJ3cml0YWJsZSIsIm1zX2RlbGF5IiwiX3RpZCIsInRpZCIsInNldEludGVydmFsIiwicm90YXRlIiwidW5yZWYiLCJfYmVsdCIsIl9jdWxsX2hhc2hiZWx0IiwiX2NyZWF0ZVRpcCIsImNvbmNhdCIsImJlbHQiLCJrZXkiLCJlYWNoIiwiaGFzIiwiX2hpdF9oYXMiLCJfbWlzc19oYXMiLCJjb2xsIiwiZ2V0IiwiX2hpdF9nZXQiLCJfbWlzc19nZXQiLCJfaGl0X3NldCIsInNldCIsIl9oaXRfZGVsZXRlIiwiZGVsZXRlIiwiX21pc3NfZGVsZXRlIiwicHJldmlvdXMiLCJjbGVhciIsImVudHJpZXMiLCJzZWVuIiwiU2V0Iiwic3oiLCJzaXplIiwiZW50cnkiLCJhZGQiLCJTeW1ib2wiLCJpdGVyYXRvciIsImtleXMiLCJ2YWx1ZXMiLCJjYWxsYmFjayIsInRoaXNBcmciLCJmb3JFYWNoIiwiSGFzaGJlbHRNYXAiLCJjYXBhY2l0eSIsImxlbmd0aCIsInRyaW0iLCJzbGljZSIsIl90cmltIiwiYmVsdF90cnVuYyIsInNldEF1dG9Sb3RhdGVJbnRlcnZhbCIsIkhhc2hiZWx0IiwiUmVhZENhY2hpbmdIYXNoYmVsdE1hcCIsIkNhY2hpbmdIYXNoYmVsdE1hcCIsIkNhY2hpbmdIYXNoYmVsdCIsImNyZWF0ZUNhY2hpbmdIYXNoYmVsdCJdLCJtYXBwaW5ncyI6Ijs7OztBQUNPLE1BQU1BLGdCQUFOLENBQXVCOzs7Ozs7O2NBT2hCQyxJQUFaLEVBQWtCO1FBQ2IsUUFBUUEsSUFBWCxFQUFrQjthQUFRLEVBQVA7S0FBbkIsTUFDSyxJQUFHLGVBQWUsT0FBT0EsSUFBekIsRUFBZ0M7YUFDMUIsRUFBQ0MsUUFBUUQsSUFBVCxFQUFUOzs7VUFFSUUsWUFBWSxlQUFlLE9BQU9GLEtBQUtDLE1BQTNCLEdBQ2RELEtBQUtDLE1BQUwsQ0FBWUUsSUFBWixDQUFpQkgsSUFBakIsQ0FEYyxHQUVkLE1BQU0sSUFBSUksR0FBSixFQUZWOztVQUlNQyxNQUFNLFFBQVFMLEtBQUtLLEdBQWIsR0FDUkwsS0FBS0ssR0FERyxHQUNHSCxXQURmOztXQUdPSSxnQkFBUCxDQUEwQixJQUExQixFQUFrQztrQkFDbEIsRUFBQ0MsT0FBT0wsU0FBUixFQURrQjthQUV2QixFQUFDTSxVQUFVLElBQVgsRUFBaUJELE9BQU8sQ0FBQ0YsR0FBRCxDQUF4QixFQUZ1QjtZQUd4QixFQUFDRyxVQUFVLElBQVgsRUFBaUJELE9BQU8sSUFBeEIsRUFId0IsRUFBbEM7Ozt3QkFNb0JFLFFBQXRCLEVBQWdDO1FBQzNCLEtBQUtDLElBQVIsRUFBZTtvQkFBZSxLQUFLQSxJQUFuQjs7UUFDYixRQUFRRCxRQUFYLEVBQXNCO1lBQ2RFLE1BQU1DLFlBQWMsTUFBTSxLQUFLQyxNQUFMLEVBQXBCLEVBQW1DSixRQUFuQyxDQUFaO1VBQ0dFLElBQUlHLEtBQVAsRUFBZTtZQUFLQSxLQUFKOztXQUNYSixJQUFMLEdBQVlDLEdBQVo7O1dBQ0ss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
