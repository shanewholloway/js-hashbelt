export function hashbelt(opt={}) {
  if (opt.call) opt = {step: opt} // use function as step()

  let belt = [], rotate = () => {
    while (belt.max <= belt.length)
      belt.expire( belt.pop() )

    belt.unshift(belt.step())
    return belt
  }

  belt.max = opt.max || 4
  belt.step = opt.step || Object
  belt.expire = opt.expire || Object
  belt.tid = setInterval( belt.rotate=rotate, opt.interval || 60000 )
  if (belt.tid.unref) belt.tid.unref() // don't hold open the NodejS event loop
  return rotate()

}

export default hashbelt
