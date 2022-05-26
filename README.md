# js-hashbelt

According to [NIST](https://xlinux.nist.gov/dads///HTML/hashbelt.html):

> hashbelt (data structure) :: Use a short list or array of hash tables to implement a hash table with aging to expire items. To expire items, add a new table at the head of the list and drop the oldest table, along with its contents. To find an item, search all the tables.


## Install

```sh
npm install hashbelt
```

## Use

```javascript
import hashbelt from 'hashbelt'

let belt = hashbelt({
  max: 4, // keep 4 belt entries (default)
  interval: 60000, // rotate every minute (default)
  step: Object, // create a new belt entry (default is {})
})


// or pass a `step()` function
let belt_map = hashbelt( () => new Map() )

// or perhaps you'd like a WeakMap?
let belt_weak = hashbelt( () => new WeakMap() )
```

## API of Hashbelt Result

Expired entries will be `pop()`'d from the end of the belt.
The first index is the most recent "tip" of the hashbelt.

```javascript
belt.rotate() // force a belt rotation
belt.step() // create a belt entry (does not insert it)
clearInterval(belt.tid) // belt.tid is the interval handle; unref'd by default

Array.isArray(belt) // belt is just an array with extra attributes

// use index 0 to access the tip
belt[0]['my_key'] = 1942
belt_map[0].set('my_key', 2042)

// use array methods or iterate the belt to consult all entries
belt.find(each => each['my_key'])
belt_map.find(map => map.has('my_key'))
```


### 2022 update (breaking changes)

To make this module more generally useful, I've changed to a minimal hashbelt
implementation ported from [msg-fabric-core/code/timeouts.jsy][msgfab].  This
change drops rarely used features such as copy forward caching and JS Map
compatibility. In exchange, the library weighs in at **~300 bytes minified**, and
**~200 bytes with brotli**.

[msgfab]: https://github.com/msg-fabric/msg-fabric-core/blob/master/code/timeouts.jsy

