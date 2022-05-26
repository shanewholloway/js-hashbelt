const testModule = require('../dist/hashbelt') // require('hashbelt')

export default function(tap) ::

  tap.test @ `it should support the Javascript Map protocol (empty)`, t => ::
    const coll = new testModule.HashbeltMap()

    t.strictEqual @ coll.has('a_key'), false
    t.strictEqual @ coll.get('a_key'), undefined
    t.strictEqual @ coll.delete('a_key'), false

    ::
      t.deepEqual @ Array.from(coll), Array.from(coll.entries())
      t.deepEqual @ Array.from(coll.entries()), []
      t.deepEqual @ Array.from(coll.keys()), []
      t.deepEqual @ Array.from(coll.values()), []

      const call_log = []
      coll.forEach @ (v,k) => call_log.push @: v,k
      t.deepEqual @ call_log, @[]


  tap.test @ `it should support the Javascript Map protocol (2 items)`, t => ::
    const coll = new testModule.HashbeltMap()

    t.strictEqual @ coll.set('a_key', 'one'), coll
    t.strictEqual @ coll.set('b_key', 'two'), coll

    t.strictEqual @ coll.has('a_key'), true
    t.strictEqual @ coll.has('b_key'), true
    t.strictEqual @ coll.has('c_key'), false

    t.strictEqual @ coll.get('a_key'), 'one'
    t.strictEqual @ coll.get('b_key'), 'two'
    t.strictEqual @ coll.get('c_key'), undefined


    ::
      t.deepEqual @ Array.from(coll), Array.from(coll.entries())
      t.deepEqual @ Array.from(coll.entries()), @# ['a_key','one'], ['b_key', 'two']
      t.deepEqual @ Array.from(coll.keys()),    @# 'a_key', 'b_key'
      t.deepEqual @ Array.from(coll.values()),  @# 'one', 'two'

      const call_log = []
      coll.forEach @ (v,k) => call_log.push @: k,v
      t.deepEqual @ call_log, @[]
          @{} v:'one', k:'a_key'
        , @{} v:'two', k:'b_key'


    t.strictEqual @ coll.delete('b_key'), true
    t.strictEqual @ coll.delete('c_key'), false

    t.strictEqual @ coll.has('a_key'), true
    t.strictEqual @ coll.has('b_key'), false
    t.strictEqual @ coll.has('c_key'), false

    t.strictEqual @ coll.get('a_key'), 'one'
    t.strictEqual @ coll.get('b_key'), undefined
    t.strictEqual @ coll.get('c_key'), undefined

    ::
      t.deepEqual @ Array.from(coll), Array.from(coll.entries())
      t.deepEqual @ Array.from(coll.entries()), @# ['a_key','one']
      t.deepEqual @ Array.from(coll.keys()),    @# 'a_key'
      t.deepEqual @ Array.from(coll.values()),  @# 'one'

      const call_log = []
      coll.forEach @ (v,k) => call_log.push @: v,k
      t.deepEqual @ call_log, @[]
          @{} v:'one', k:'a_key'

