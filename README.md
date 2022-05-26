# js-hashbelt

According to [NIST](https://xlinux.nist.gov/dads///HTML/hashbelt.html):

> hashbelt (data structure) :: Use a short list or array of hash tables to implement a hash table with aging to expire items. To expire items, add a new table at the head of the list and drop the oldest table, along with its contents. To find an item, search all the tables.


### 2022 update (breaking changes)

To make this module more generally useful, I've changed to a minimal hashbelt
implementation ported from [msg-fabric-core/code/timeouts.jsy][msgfab].  This
change drops rarely used features such as copy forward caching and JS Map
compatibility. In exchange, the library weighs in at **~300 bytes minified**, and
**~200 bytes with brotli**.

[msgfab]: https://github.com/msg-fabric/msg-fabric-core/blob/master/code/timeouts.jsy

