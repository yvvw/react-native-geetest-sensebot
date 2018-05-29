import invariant from 'invariant'

export default params => {
  invariant(
    typeof params === 'object' &&
    typeof params.success === 'number' &&
    typeof params.gt === 'string' &&
    typeof params.challenge === 'string',
    'captcha params must be an object have success(Number) gt(String) challenge(String), but get %s', params
  )
}
