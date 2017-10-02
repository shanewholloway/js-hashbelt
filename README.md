# js-hashbelt

According to [NIST](https://xlinux.nist.gov/dads///HTML/hashbelt.html):

> hashbelt (data structure) :: Use a short list or array of hash tables to implement a hash table with aging to expire items. To expire items, add a new table at the head of the list and drop the oldest table, along with its contents. To find an item, search all the tables.

