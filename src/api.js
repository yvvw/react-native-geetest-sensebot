import { NativeEventEmitter, NativeModules, Platform } from 'react-native'
import processColor from './lib/processColor'
import validUrl from './lib/validUrl'
import validCaptchaParams from './lib/validCaptchaParams'
import invariant from 'invariant'
import { EVENT_TYPE, ERROR_TYPE } from './constant'

const { GeetestSensebot } = NativeModules

const GSConfig = {
  api1: null,
  api2: null,
  maskColor: processColor('transparent'),
  isDebug: false
}

/**
 * configApi 配置 api 地址
 * @param  {String} api1
 * @param  {String} api2
 * @return {void}
 */
export const configApi = (api1, api2) => {
  validUrl(api1)
  GSConfig.api1 = api1
  validUrl(api2)
  GSConfig.api2 = api2
}

/**
 * setMaskColor 配置行为验证背景遮罩颜色 iosOnly
 * @param  {String} color
 * @return {void}
 */
export const setMaskColor = color => {
  if (Platform.OS !== 'ios') return // 避免不必要的计算
  GSConfig.maskColor = processColor(color)
}

/**
 * enableDebug 开启调试 iosOnly
 * @param  {Boolean} isDebug
 * @return {void}
 */
export const enableDebug = isDebug => {
  GSConfig.isDebug = !!isDebug
}

/**
 * captcha 行为验证
 */
export const captcha = async argument => {
  invariant(
    GSConfig.api1 !== null && GSConfig.api2 !== null,
    'api address must be set, please run configApi function first.'
  )

  const {
    api1ReqReplacer, api1RespHandler,
    api2ReqReplacer, api2RespHandler
  } = argument || {}

  let payload = null
  let errCode = null
  let errMsg = null

  // initial captcha manager
  await GeetestSensebot.initCaptchaMgr(GSConfig.maskColor, GSConfig.isDebug)

  // api1 request
  let api1Resp = null
  let captchaParams = null
  try {
    let api1Req = new Request(GSConfig.api1, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    })
    if (typeof api1ReqReplacer === 'function') {
      api1Req = await api1ReqReplacer(api2Req)
      if (!(api1Req instanceof Request)) {
        throw Error('api1ReqReplacer return value not a valid request object')
      }
    }
    api1Resp = await fetch(api1Req)
  } catch (e) {
    throw new GSError({
      errCode: ERROR_TYPE.API1,
      errMsg: `api1 request failed, ${e.message}`
    })
  }
  // api1 resp handle
  if (typeof api1RespHandler === 'function') {
    captchaParams = await api1RespHandler(api1Resp)
  } else {
    captchaParams = await defaultApi1RespHandler(api1Resp)
  }

  // captcha
  try {
    validCaptchaParams(captchaParams)
  } catch (e) {
    throw new GSError({
      errCode: ERROR_TYPE.CAPTCHA,
      errMsg: `captcha params error, ${e.message}`
    })
  }
  const capcataStartRes = await GeetestSensebot.captcha(
    captchaParams.success,
    captchaParams.gt,
    captchaParams.challenge,
    GSConfig.api2
  )
  if (!capcataStartRes) {
    throw new GSError({
      errCode: ERROR_TYPE.CAPTCHA,
      errMsg: 'captcha start failed, can\'t find captcha manager.'
    })
  }
  const captchaRes = await rnGSEventListener(EVENT_TYPE.CAPTCHA)
  payload = captchaRes.payload
  errCode = captchaRes.errCode
  errMsg = captchaRes.errMsg
  if (errCode) {
    throw new GSError({ errCode: ERROR_TYPE.CAPTCHA, errMsg })
  }
  // from sdk @param code 验证交互结果, 0失败/1成功
  if (payload.code !== '1') {
    throw new GSError({
      errCode: ERROR_TYPE.CAPTCHA,
      errMsg: `captcha valid failed, ${payload.message}`
    })
  }

  // api2 request
  // @param { geetest_challenge: "", geetest_seccode: "", geetest_validate: "" }
  const api2ReqParams = payload.result
  let api2Resp = null
  try {
    let api2Req = new Request(GSConfig.api2, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(api2ReqParams)
    })
    if (typeof api2ReqReplacer === 'function') {
      api2Req = await api2ReqReplacer(api2Req)
      if (!(api2Req instanceof Request)) {
        throw Error('second params not a valid request object')
      }
    }
    api2Resp = await fetch(api2Req)
  } catch (e) {
    throw new GSError({
      errCode: EVENT_TYPE.API2,
      errMsg: `api2 request failed, ${e.message}`
    })
  }
  // clean
  stopCaptcha()

  // api2 resp handle
  if (typeof api2RespHandler === 'function') {
    return api2RespHandler(api2Resp)
  } else {
    return defaultApi2RespHandler(api2Resp)
  }
}

/**
 * stopCaptcha 停止行为验证
 */
const stopCaptcha = () => {
  return GeetestSensebot.stopCaptcha()
}


/* event handle */
const GSEmitter = new NativeEventEmitter(GeetestSensebot)

const rnGSEventListener = listenEventType => {
  return new Promise(resolve => {
    let subscription = null
    const handleGSEvent = ({ type, ...otherParams }) => {
      if (type === EVENT_TYPE.ERROR) {
        resolve(otherParams)
        return
      }
      if (listenEventType !== type) return
      clearSubscribe()
      resolve(otherParams)
    }
    const clearSubscribe = () => {
      subscription.remove()
    }

    subscription = GSEmitter.addListener('RNGeetestSensebotEvent', handleGSEvent)
  })
}
/* event handle end */


/* default captcha funcs */
const defaultApi1RespHandler = async api1Resp => {
  /**
   * api1 官方示例接口
   * http://www.geetest.com/demo/gt/register-test
   */
  if (api1Resp.status !== 200) {
    throw new GSError({
      errCode: ERROR_TYPE.API1,
      errMsg: `api1 request error, ${await api1Resp.text()}`
    })
  }
  try {
    return api1Resp.json()
  } catch (e) {
    throw new GSError({
      errCode: ERROR_TYPE.API1,
      errMsg: `api1 request error, response result need json format, but get ${await api1Resp.text()}`
    })
  }
}

const defaultApi2RespHandler = async api2Resp => {
  /**
   * api2 官方示例接口
   * http://www.geetest.com/demo/gt/validate-test
   */
  if (api2Resp.status !== 200) {
    throw new GSError({
      errCode: ERROR_TYPE.API2,
      errMsg: `api2 request error, ${await api2Resp.text()}`
    })
  }
  try {
    return api2Resp.json()
  } catch (e) {
    return api2Resp.text()
  }
}
/* default captcha funcs end */


export class GSError extends Error {
  constructor ({ errCode, errMsg }) {
    super(errMsg)

    this.name = 'GSError'
    this.errCode = errCode
    this.errMsg = errMsg

    if (typeof Object.setPrototypeOf === 'function') {
      Object.setPrototypeOf(this, GSError.prototype)
    } else {
      this.__proto__ = GSError.prototype
    }

    stopCaptcha()
  }
}
