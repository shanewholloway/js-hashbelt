import hashbelt from '../esm/hashbelt.js'

export default function(tap) {
  tap.test( `rotation should work`, t => {
    const belt = hashbelt()
    _gen_rotated_entries(belt)

    const entries = [... belt]
    t.deepEqual( entries, [
      {"a2":"a after"},
      {"b2":"b after","a0":"a zero","a1":"a one"},
      {"c2":"c after","b0":"b zero","b1":"b one"},
      {"d2":"d after","c0":"c zero","c1":"c one"},
    ])
  })
}



function _gen_rotated_entries(belt, keys) {
  if (null == keys)
    keys = 'a b c d e f g h i j k'.split(/\s+/)

  keys = Array.from(keys).reverse()
  for (const k of keys) {
    belt[0][`${k}0`] = `${k} zero`
    belt[0][`${k}1`] = `${k} one`
    belt.rotate()
    belt[0][`${k}2`] = `${k} after`
  }

  return belt
}

