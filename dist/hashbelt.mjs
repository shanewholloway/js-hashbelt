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

export { BasicHashbeltMap, HashbeltMap, Hashbelt, ReadCachingHashbeltMap, CachingHashbeltMap, CachingHashbelt };
export default createCachingHashbelt;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGFzaGJlbHQubWpzIiwic291cmNlcyI6WyIuLi9jb2RlL2luZGV4LmpzeSJdLCJzb3VyY2VzQ29udGVudCI6WyJcbmV4cG9ydCBjbGFzcyBCYXNpY0hhc2hiZWx0TWFwIDo6XG4gIC8vIEJhc2ljSGFzaGJlbHRNYXBcbiAgLy8gICBvcHRpb25zOiBAe31cbiAgLy8gICAgIGNyZWF0ZSAgLS0gIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyBhIE1hcC1jb21wYXRpYmxlIG9iamVjdCxcbiAgLy8gICAgICAgICAgICAgICAgIGltcGxlbWVudGluZyBoYXMoKSwgZ2V0KCksIHNldCgpLCBkZWxldGUoKSwgZW50cmllcygpLCBhbmQgY2xlYXIoKVxuICAvLyAgICAgdGlwICAgICAtLSAgaW5pdGlhbCBNYXAtY29tcGF0aWJsZSBvYmplY3QgdG8gdXNlIGFzIHRoZSB0aXBcblxuICBjb25zdHJ1Y3RvcihvcHRzKSA6OlxuICAgIGlmIG51bGwgPT0gb3B0cyA6OiBvcHRzID0ge31cbiAgICBlbHNlIGlmICdmdW5jdGlvbicgPT09IHR5cGVvZiBvcHRzIDo6XG4gICAgICBvcHRzID0gQDogY3JlYXRlOiBvcHRzXG5cbiAgICBjb25zdCBjcmVhdGVUaXAgPSAnZnVuY3Rpb24nID09PSB0eXBlb2Ygb3B0cy5jcmVhdGVcbiAgICAgID8gb3B0cy5jcmVhdGUuYmluZChvcHRzKVxuICAgICAgOiAoKSA9PiBuZXcgTWFwKClcblxuICAgIGNvbnN0IHRpcCA9IG51bGwgIT0gb3B0cy50aXBcbiAgICAgID8gb3B0cy50aXAgOiBjcmVhdGVUaXAoKVxuXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnRpZXMgQCB0aGlzLCBAOlxuICAgICAgX2NyZWF0ZVRpcDogQDogdmFsdWU6IGNyZWF0ZVRpcFxuICAgICAgX2JlbHQ6IEA6IHdyaXRhYmxlOiB0cnVlLCB2YWx1ZTogW3RpcF1cbiAgICAgIF90aWQ6IEA6IHdyaXRhYmxlOiB0cnVlLCB2YWx1ZTogbnVsbFxuXG5cbiAgc2V0QXV0b1JvdGF0ZUludGVydmFsKG1zX2RlbGF5KSA6OlxuICAgIGlmIHRoaXMuX3RpZCA6OiBjbGVhckludGVydmFsKHRoaXMuX3RpZClcbiAgICBpZiBudWxsICE9IG1zX2RlbGF5IDo6XG4gICAgICBjb25zdCB0aWQgPSBzZXRJbnRlcnZhbCBAICgpID0+IHRoaXMucm90YXRlKCksIG1zX2RlbGF5XG4gICAgICBpZiB0aWQudW5yZWYgOjogdGlkLnVucmVmKClcbiAgICAgIHRoaXMuX3RpZCA9IHRpZFxuICAgIHJldHVybiB0aGlzXG5cbiAgcm90YXRlKCkgOjpcbiAgICB0aGlzLl9iZWx0ID0gdGhpcy5fY3VsbF9oYXNoYmVsdCBAXG4gICAgICBbdGhpcy5fY3JlYXRlVGlwKCldXG4gICAgICAgIC5jb25jYXQgQCB0aGlzLl9iZWx0XG4gICAgcmV0dXJuIHRoaXNcblxuICBfY3VsbF9oYXNoYmVsdChiZWx0KSA6OiByZXR1cm4gYmVsdFxuXG5cblxuICBoYXMoa2V5KSA6OlxuICAgIGZvciBjb25zdCBlYWNoIG9mIHRoaXMuX2JlbHQgOjpcbiAgICAgIGlmIGVhY2guaGFzKGtleSkgOjpcbiAgICAgICAgdGhpcy5faGl0X2hhcyhrZXksIGVhY2gpXG4gICAgICAgIHJldHVybiB0cnVlXG5cbiAgICByZXR1cm4gISEgdGhpcy5fbWlzc19oYXMoa2V5KVxuXG4gIF9oaXRfaGFzKGtleSwgY29sbCkgOjpcbiAgX21pc3NfaGFzKGtleSkgOjpcblxuXG4gIGdldChrZXkpIDo6XG4gICAgZm9yIGNvbnN0IGVhY2ggb2YgdGhpcy5fYmVsdCA6OlxuICAgICAgaWYgZWFjaC5oYXMoa2V5KSA6OlxuICAgICAgICBjb25zdCB2YWx1ZSA9IGVhY2guZ2V0KGtleSlcbiAgICAgICAgdGhpcy5faGl0X2dldChrZXksIHZhbHVlLCBlYWNoKVxuICAgICAgICByZXR1cm4gdmFsdWVcbiAgICByZXR1cm4gdGhpcy5fbWlzc19nZXQoa2V5KVxuXG4gIF9oaXRfZ2V0KGtleSwgdmFsdWUsIGNvbGwpIDo6XG4gIF9taXNzX2dldChrZXkpIDo6XG5cblxuICBzZXQoa2V5LCB2YWx1ZSkgOjpcbiAgICBjb25zdCB0aXAgPSB0aGlzLl9iZWx0WzBdXG4gICAgdGhpcy5faGl0X3NldChrZXksIHZhbHVlLCB0aXApXG4gICAgdGlwLnNldChrZXksIHZhbHVlKVxuICAgIHJldHVybiB0aGlzXG5cbiAgX2hpdF9zZXQoa2V5LCB2YWx1ZSwgY29sbCkgOjpcblxuXG4gIGRlbGV0ZShrZXkpIDo6XG4gICAgZm9yIGNvbnN0IGVhY2ggb2YgdGhpcy5fYmVsdCA6OlxuICAgICAgaWYgZWFjaC5oYXMoa2V5KSA6OlxuICAgICAgICB0aGlzLl9oaXRfZGVsZXRlKGtleSwgZWFjaClcbiAgICAgICAgcmV0dXJuIGVhY2guZGVsZXRlKGtleSlcblxuICAgIHJldHVybiAhISB0aGlzLl9taXNzX2RlbGV0ZShrZXkpXG5cbiAgX2hpdF9kZWxldGUoa2V5LCBjb2xsKSA6OlxuICBfbWlzc19kZWxldGUoa2V5KSA6OlxuXG5cblxuICBjbGVhcigpIDo6XG4gICAgY29uc3QgcHJldmlvdXMgPSB0aGlzLl9iZWx0XG4gICAgdGhpcy5fYmVsdCA9IFtuZXcgdGhpcy5fY3JlYXRlVGlwKCldXG5cbiAgICBpZiBwcmV2aW91cyA6OlxuICAgICAgZm9yIGNvbnN0IGVhY2ggb2YgcHJldmlvdXMgOjpcbiAgICAgICAgZWFjaC5jbGVhcigpXG5cblxuICAqZW50cmllcygpIDo6XG4gICAgY29uc3Qgc2VlbiA9IG5ldyBTZXQoKVxuICAgIGxldCBzeiA9IHNlZW4uc2l6ZVxuXG4gICAgZm9yIGNvbnN0IGVhY2ggb2YgdGhpcy5fYmVsdCA6OlxuICAgICAgZm9yIGNvbnN0IGVudHJ5IG9mIGVhY2guZW50cmllcygpIDo6XG4gICAgICAgIHNlZW4uYWRkKGVudHJ5WzBdKVxuICAgICAgICBpZiBzeiAhPT0gc2Vlbi5zaXplIDo6XG4gICAgICAgICAgc3ogPSBzZWVuLnNpemVcbiAgICAgICAgICB5aWVsZCBlbnRyeVxuXG4gIFtTeW1ib2wuaXRlcmF0b3JdKCkgOjpcbiAgICByZXR1cm4gdGhpcy5lbnRyaWVzKClcbiAgKmtleXMoKSA6OlxuICAgIGZvciBjb25zdCBlbnRyeSBvZiB0aGlzLmVudHJpZXMoKSA6OlxuICAgICAgeWllbGQgZW50cnlbMF1cbiAgKnZhbHVlcygpIDo6XG4gICAgZm9yIGNvbnN0IGVudHJ5IG9mIHRoaXMuZW50cmllcygpIDo6XG4gICAgICB5aWVsZCBlbnRyeVsxXVxuICBmb3JFYWNoKGNhbGxiYWNrLCB0aGlzQXJnKSA6OlxuICAgIHJldHVybiBuZXcgTWFwKHRoaXMuZW50cmllcygpKS5mb3JFYWNoKGNhbGxiYWNrLCB0aGlzQXJnKVxuXG5cblxuZXhwb3J0IGNsYXNzIEhhc2hiZWx0TWFwIGV4dGVuZHMgQmFzaWNIYXNoYmVsdE1hcCA6OlxuICBjb25zdHJ1Y3RvcihvcHRzKSA6OlxuICAgIGlmIG51bGwgPT0gb3B0cyA6OiBvcHRzID0ge31cbiAgICBzdXBlcihvcHRzKVxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzIEAgdGhpcywgQDpcbiAgICAgICAgY2FwYWNpdHk6IEA6IHZhbHVlOiBvcHRzLmNhcGFjaXR5IHx8IDVcblxuICBfY3VsbF9oYXNoYmVsdChiZWx0KSA6OlxuICAgIGNvbnN0IGNhcGFjaXR5ID0gdGhpcy5jYXBhY2l0eVxuICAgIGlmIG51bGwgIT0gY2FwYWNpdHkgJiYgY2FwYWNpdHkgPCBiZWx0Lmxlbmd0aCA6OlxuICAgICAgY29uc3QgdHJpbSA9IGJlbHQuc2xpY2UoY2FwYWNpdHkpXG4gICAgICBiZWx0ID0gYmVsdC5zbGljZSgwLCBjYXBhY2l0eSlcbiAgICAgIHRoaXMuX3RyaW0gQCB0cmltLCBiZWx0XG4gICAgcmV0dXJuIGJlbHRcbiAgX3RyaW0oYmVsdF90cnVuYykgOjpcblxuICBhdXRvUm90YXRlKG1zX2RlbGF5PTYwMDAwKSA6OlxuICAgIHJldHVybiB0aGlzLnNldEF1dG9Sb3RhdGVJbnRlcnZhbChtc19kZWxheSlcblxuZXhwb3J0IGNvbnN0IEhhc2hiZWx0ID0gSGFzaGJlbHRNYXBcblxuXG5cbmV4cG9ydCBjbGFzcyBSZWFkQ2FjaGluZ0hhc2hiZWx0TWFwIGV4dGVuZHMgSGFzaGJlbHRNYXAgOjpcbiAgX2hpdF9nZXQoa2V5LCB2YWx1ZSwgY29sbCkgOjpcbiAgICAvLyBjb3B5IHRoZSBoaXQgdG8gdGhlIGZyb250IG9mIHRoZSBjYWNoZVxuICAgIGNvbnN0IHRpcCA9IHRoaXMuX2JlbHRbMF1cbiAgICB0aXAuc2V0KGtleSwgdmFsdWUpXG5cbmV4cG9ydCBjb25zdCBDYWNoaW5nSGFzaGJlbHRNYXAgPSBSZWFkQ2FjaGluZ0hhc2hiZWx0TWFwXG5leHBvcnQgY29uc3QgQ2FjaGluZ0hhc2hiZWx0ID0gUmVhZENhY2hpbmdIYXNoYmVsdE1hcFxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBjcmVhdGVDYWNoaW5nSGFzaGJlbHQob3B0cykgOjpcbiAgcmV0dXJuIG5ldyBSZWFkQ2FjaGluZ0hhc2hiZWx0TWFwIEAgb3B0c1xuXG4iXSwibmFtZXMiOlsiQmFzaWNIYXNoYmVsdE1hcCIsIm9wdHMiLCJjcmVhdGUiLCJjcmVhdGVUaXAiLCJiaW5kIiwiTWFwIiwidGlwIiwiZGVmaW5lUHJvcGVydGllcyIsInZhbHVlIiwid3JpdGFibGUiLCJtc19kZWxheSIsIl90aWQiLCJ0aWQiLCJzZXRJbnRlcnZhbCIsInJvdGF0ZSIsInVucmVmIiwiX2JlbHQiLCJfY3VsbF9oYXNoYmVsdCIsIl9jcmVhdGVUaXAiLCJjb25jYXQiLCJiZWx0Iiwia2V5IiwiZWFjaCIsImhhcyIsIl9oaXRfaGFzIiwiX21pc3NfaGFzIiwiY29sbCIsImdldCIsIl9oaXRfZ2V0IiwiX21pc3NfZ2V0IiwiX2hpdF9zZXQiLCJzZXQiLCJfaGl0X2RlbGV0ZSIsImRlbGV0ZSIsIl9taXNzX2RlbGV0ZSIsInByZXZpb3VzIiwiY2xlYXIiLCJlbnRyaWVzIiwic2VlbiIsIlNldCIsInN6Iiwic2l6ZSIsImVudHJ5IiwiYWRkIiwiU3ltYm9sIiwiaXRlcmF0b3IiLCJrZXlzIiwidmFsdWVzIiwiY2FsbGJhY2siLCJ0aGlzQXJnIiwiZm9yRWFjaCIsIkhhc2hiZWx0TWFwIiwiY2FwYWNpdHkiLCJsZW5ndGgiLCJ0cmltIiwic2xpY2UiLCJfdHJpbSIsImJlbHRfdHJ1bmMiLCJzZXRBdXRvUm90YXRlSW50ZXJ2YWwiLCJIYXNoYmVsdCIsIlJlYWRDYWNoaW5nSGFzaGJlbHRNYXAiLCJDYWNoaW5nSGFzaGJlbHRNYXAiLCJDYWNoaW5nSGFzaGJlbHQiLCJjcmVhdGVDYWNoaW5nSGFzaGJlbHQiXSwibWFwcGluZ3MiOiJBQUNPLE1BQU1BLGdCQUFOLENBQXVCOzs7Ozs7O2NBT2hCQyxJQUFaLEVBQWtCO1FBQ2IsUUFBUUEsSUFBWCxFQUFrQjthQUFRLEVBQVA7S0FBbkIsTUFDSyxJQUFHLGVBQWUsT0FBT0EsSUFBekIsRUFBZ0M7YUFDMUIsRUFBQ0MsUUFBUUQsSUFBVCxFQUFUOzs7VUFFSUUsWUFBWSxlQUFlLE9BQU9GLEtBQUtDLE1BQTNCLEdBQ2RELEtBQUtDLE1BQUwsQ0FBWUUsSUFBWixDQUFpQkgsSUFBakIsQ0FEYyxHQUVkLE1BQU0sSUFBSUksR0FBSixFQUZWOztVQUlNQyxNQUFNLFFBQVFMLEtBQUtLLEdBQWIsR0FDUkwsS0FBS0ssR0FERyxHQUNHSCxXQURmOztXQUdPSSxnQkFBUCxDQUEwQixJQUExQixFQUFrQztrQkFDbEIsRUFBQ0MsT0FBT0wsU0FBUixFQURrQjthQUV2QixFQUFDTSxVQUFVLElBQVgsRUFBaUJELE9BQU8sQ0FBQ0YsR0FBRCxDQUF4QixFQUZ1QjtZQUd4QixFQUFDRyxVQUFVLElBQVgsRUFBaUJELE9BQU8sSUFBeEIsRUFId0IsRUFBbEM7Ozt3QkFNb0JFLFFBQXRCLEVBQWdDO1FBQzNCLEtBQUtDLElBQVIsRUFBZTtvQkFBZSxLQUFLQSxJQUFuQjs7UUFDYixRQUFRRCxRQUFYLEVBQXNCO1lBQ2RFLE1BQU1DLFlBQWMsTUFBTSxLQUFLQyxNQUFMLEVBQXBCLEVBQW1DSixRQUFuQyxDQUFaO1VBQ0dFLElBQUlHLEtBQVAsRUFBZTtZQUFLQSxLQUFKOztXQUNYSixJQUFMLEdBQVlDLEdBQVo7O1dBQ0ssSUFBUDs7O1dBRU87U0FDRkksS0FBTCxHQUFhLEtBQUtDLGNBQUwsQ0FDWCxDQUFDLEtBQUtDLFVBQUwsRUFBRCxFQUNHQyxNQURILENBQ1ksS0FBS0gsS0FEakIsQ0FEVyxDQUFiO1dBR08sSUFBUDs7O2lCQUVhSSxJQUFmLEVBQXFCO1dBQVVBLElBQVA7OztNQUlwQkMsR0FBSixFQUFTO1NBQ0gsTUFBTUMsSUFBVixJQUFrQixLQUFLTixLQUF2QixFQUErQjtVQUMxQk0sS0FBS0MsR0FBTCxDQUFTRixHQUFULENBQUgsRUFBbUI7YUFDWkcsUUFBTCxDQUFjSCxHQUFkLEVBQW1CQyxJQUFuQjtlQUNPLElBQVA7Ozs7V0FFRyxDQUFDLENBQUUsS0FBS0csU0FBTCxDQUFlSixHQUFmLENBQVY7OztXQUVPQSxHQUFULEVBQWNLLElBQWQsRUFBb0I7WUFDVkwsR0FBVixFQUFlOztNQUdYQSxHQUFKLEVBQVM7U0FDSCxNQUFNQyxJQUFWLElBQWtCLEtBQUtOLEtBQXZCLEVBQStCO1VBQzFCTSxLQUFLQyxHQUFMLENBQVNGLEdBQVQsQ0FBSCxFQUFtQjtjQUNYYixRQUFRYyxLQUFLSyxHQUFMLENBQVNOLEdBQVQsQ0FBZDthQUNLTyxRQUFMLENBQWNQLEdBQWQsRUFBbUJiLEtBQW5CLEVBQTBCYyxJQUExQjtlQUNPZCxLQUFQOzs7V0FDRyxLQUFLcUIsU0FBTCxDQUFlUixHQUFmLENBQVA7OztXQUVPQSxHQUFULEVBQWNiLEtBQWQsRUFBcUJrQixJQUFyQixFQUEyQjtZQUNqQkwsR0FBVixFQUFlOztNQUdYQSxHQUFKLEVBQVNiLEtBQVQsRUFBZ0I7VUFDUkYsTUFBTSxLQUFLVSxLQUFMLENBQVcsQ0FBWCxDQUFaO1NBQ0tjLFFBQUwsQ0FBY1QsR0FBZCxFQUFtQmIsS0FBbkIsRUFBMEJGLEdBQTFCO1FBQ0l5QixHQUFKLENBQVFWLEdBQVIsRUFBYWIsS0FBYjtXQUNPLElBQVA7OztXQUVPYSxHQUFULEVBQWNiLEtBQWQsRUFBcUJrQixJQUFyQixFQUEyQjs7U0FHcEJMLEdBQVAsRUFBWTtTQUNOLE1BQU1DLElBQVYsSUFBa0IsS0FBS04sS0FBdkIsRUFBK0I7VUFDMUJNLEtBQUtDLEdBQUwsQ0FBU0YsR0FBVCxDQUFILEVBQW1CO2FBQ1pXLFdBQUwsQ0FBaUJYLEdBQWpCLEVBQXNCQyxJQUF0QjtlQUNPQSxLQUFLVyxNQUFMLENBQVlaLEdBQVosQ0FBUDs7OztXQUVHLENBQUMsQ0FBRSxLQUFLYSxZQUFMLENBQWtCYixHQUFsQixDQUFWOzs7Y0FFVUEsR0FBWixFQUFpQkssSUFBakIsRUFBdUI7ZUFDVkwsR0FBYixFQUFrQjs7VUFJVjtVQUNBYyxXQUFXLEtBQUtuQixLQUF0QjtTQUNLQSxLQUFMLEdBQWEsQ0FBQyxJQUFJLEtBQUtFLFVBQVQsRUFBRCxDQUFiOztRQUVHaUIsUUFBSCxFQUFjO1dBQ1IsTUFBTWIsSUFBVixJQUFrQmEsUUFBbEIsRUFBNkI7YUFDdEJDLEtBQUw7Ozs7O0dBR0xDLE9BQUQsR0FBVztVQUNIQyxPQUFPLElBQUlDLEdBQUosRUFBYjtRQUNJQyxLQUFLRixLQUFLRyxJQUFkOztTQUVJLE1BQU1uQixJQUFWLElBQWtCLEtBQUtOLEtBQXZCLEVBQStCO1dBQ3pCLE1BQU0wQixLQUFWLElBQW1CcEIsS0FBS2UsT0FBTCxFQUFuQixFQUFvQzthQUM3Qk0sR0FBTCxDQUFTRCxNQUFNLENBQU4sQ0FBVDtZQUNHRixPQUFPRixLQUFLRyxJQUFmLEVBQXNCO2VBQ2ZILEtBQUtHLElBQVY7Z0JBQ01DLEtBQU47Ozs7OztHQUVQRSxPQUFPQyxRQUFSLElBQW9CO1dBQ1gsS0FBS1IsT0FBTCxFQUFQOztHQUNEUyxJQUFELEdBQVE7U0FDRixNQUFNSixLQUFWLElBQW1CLEtBQUtMLE9BQUwsRUFBbkIsRUFBb0M7WUFDNUJLLE1BQU0sQ0FBTixDQUFOOzs7R0FDSEssTUFBRCxHQUFVO1NBQ0osTUFBTUwsS0FBVixJQUFtQixLQUFLTCxPQUFMLEVBQW5CLEVBQW9DO1lBQzVCSyxNQUFNLENBQU4sQ0FBTjs7O1VBQ0lNLFFBQVIsRUFBa0JDLE9BQWxCLEVBQTJCO1dBQ2xCLElBQUk1QyxHQUFKLENBQVEsS0FBS2dDLE9BQUwsRUFBUixFQUF3QmEsT0FBeEIsQ0FBZ0NGLFFBQWhDLEVBQTBDQyxPQUExQyxDQUFQOzs7O0FBSUosQUFBTyxNQUFNRSxXQUFOLFNBQTBCbkQsZ0JBQTFCLENBQTJDO2NBQ3BDQyxJQUFaLEVBQWtCO1FBQ2IsUUFBUUEsSUFBWCxFQUFrQjthQUFRLEVBQVA7O1VBQ2JBLElBQU47V0FDT00sZ0JBQVAsQ0FBMEIsSUFBMUIsRUFBa0M7Z0JBQ2xCLEVBQUNDLE9BQU9QLEtBQUttRCxRQUFMLElBQWlCLENBQXpCLEVBRGtCLEVBQWxDOzs7aUJBR2FoQyxJQUFmLEVBQXFCO1VBQ2JnQyxXQUFXLEtBQUtBLFFBQXRCO1FBQ0csUUFBUUEsUUFBUixJQUFvQkEsV0FBV2hDLEtBQUtpQyxNQUF2QyxFQUFnRDtZQUN4Q0MsT0FBT2xDLEtBQUttQyxLQUFMLENBQVdILFFBQVgsQ0FBYjthQUNPaEMsS0FBS21DLEtBQUwsQ0FBVyxDQUFYLEVBQWNILFFBQWQsQ0FBUDtXQUNLSSxLQUFMLENBQWFGLElBQWIsRUFBbUJsQyxJQUFuQjs7V0FDS0EsSUFBUDs7UUFDSXFDLFVBQU4sRUFBa0I7O2FBRVAvQyxXQUFTLEtBQXBCLEVBQTJCO1dBQ2xCLEtBQUtnRCxxQkFBTCxDQUEyQmhELFFBQTNCLENBQVA7Ozs7QUFFSixBQUFPLE1BQU1pRCxXQUFXUixXQUFqQjs7QUFJUCxBQUFPLE1BQU1TLHNCQUFOLFNBQXFDVCxXQUFyQyxDQUFpRDtXQUM3QzlCLEdBQVQsRUFBY2IsS0FBZCxFQUFxQmtCLElBQXJCLEVBQTJCOztVQUVuQnBCLE1BQU0sS0FBS1UsS0FBTCxDQUFXLENBQVgsQ0FBWjtRQUNJZSxHQUFKLENBQVFWLEdBQVIsRUFBYWIsS0FBYjs7OztBQUVKLEFBQU8sTUFBTXFELHFCQUFxQkQsc0JBQTNCO0FBQ1AsQUFBTyxNQUFNRSxrQkFBa0JGLHNCQUF4Qjs7QUFFUCxBQUFlLFNBQVNHLHFCQUFULENBQStCOUQsSUFBL0IsRUFBcUM7U0FDM0MsSUFBSTJELHNCQUFKLENBQTZCM0QsSUFBN0IsQ0FBUDs7Ozs7OyJ9
