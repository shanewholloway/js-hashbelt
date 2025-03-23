export function hashbelt(opt={}) {
  if (opt.call) opt = {step: opt} // use function as step()


  let belt = Object.assign([],
    { interval: 60000,
      max: 4,
      step: Object,
      expire: Boolean,
      clear: () => _rot(belt, 1),
      rotate: () => _rot(belt, belt.max),
    }, opt)

  let tid = belt.tid = setInterval( belt.rotate, belt.interval )
  if (tid.unref) tid.unref() // don't hold open the NodeJS event loop
  return belt.rotate()
}

function _rot(belt, max) {
  belt.unshift( belt.step() )
  while (max < belt.length)
    belt.expire( belt.pop() )
  return belt
}

export default hashbelt
