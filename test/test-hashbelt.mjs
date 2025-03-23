import {describe, it} from '#test_bdd'
import {assert, expect} from 'chai'

import hashbelt from 'hashbelt'

describe(`hashbelt`, () => {
  it(`api`, () => {
    const belt = hashbelt()
    expect(belt).instanceof(Array)
    expect(belt.rotate).to.be.a('function')
    expect(belt.clear).to.be.a('function')
    expect(belt.step).to.be.a('function')
    expect(belt.expire).to.be.a('function')
    expect(belt.max).to.be.a('number')
    expect(belt.interval).to.be.a('number')
  })

  it(`rotate()`, () => {
    const belt = hashbelt()
    _gen_rotated_entries(belt)

    const entries = [... belt]
    assert.deepEqual( entries, [
      {"a2":"a after"},
      {"b2":"b after","a0":"a zero","a1":"a one"},
      {"c2":"c after","b0":"b zero","b1":"b one"},
      {"d2":"d after","c0":"c zero","c1":"c one"},
    ])
  })

  it(`clear()`, () => {
    const belt = hashbelt()
    _gen_rotated_entries(belt)
    belt.clear()

    const entries = [... belt]
    assert.deepEqual( entries, [ {} ])
  })

  it(`rotate() with step`, () => {
    let _idx_ = 100
    const belt = hashbelt(() => ({_idx_: ++_idx_}))
    _gen_rotated_entries(belt)

    const entries = [... belt]
    assert.deepEqual( entries, [
      {_idx_: 112, "a2":"a after"},
      {_idx_: 111, "b2":"b after","a0":"a zero","a1":"a one"},
      {_idx_: 110, "c2":"c after","b0":"b zero","b1":"b one"},
      {_idx_: 109, "d2":"d after","c0":"c zero","c1":"c one"},
    ])
  })

  it(`rotate() with step and max=2`, () => {
    let _idx_ = 100
    const belt = hashbelt({
      step() { return {_idx_: ++_idx_} },
      max: 2,
    })
    _gen_rotated_entries(belt)

    const entries = [... belt]
    assert.deepEqual( entries, [
      {_idx_: 112, "a2":"a after"},
      {_idx_: 111, "b2":"b after","a0":"a zero","a1":"a one"},
    ])
  })

})



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

