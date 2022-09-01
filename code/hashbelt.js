export function hashbelt(opt={}) {
  if (opt.call) opt = {step: opt} // use function as step()

  let belt = Object.assign([],
    { interval: 60000,
      max: 4,
      step: Object,
      expire: Boolean,
      rotate() {
        belt.unshift( belt.step() )
        while (belt.max < belt.length)
          belt.expire( belt.pop() )
        return belt
      }
    }, opt)

  let tid = belt.tid = setInterval( belt.rotate, belt.interval )
  if (tid.unref) tid.unref() // don't hold open the NodejS event loop
  return belt.rotate()
}

export default hashbelt
