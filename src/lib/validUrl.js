import invariant from 'invariant'

export default arg => {
  invariant(
    typeof arg === 'string',
    'expect url is string type, but get %s', typeof arg
  )
  invariant(
    /^https?:\/\//.test(arg),
    'expect url is valid http address, but get %s', arg
  )
}
