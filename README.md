# react-native-geetest-sensebot

[GEETEST极验行为验证](https://docs.geetest.com/install/overview/start/) for React Native

## 安装

```bash
yarn add @yyyyu/react-native-geetest-sensebot
```

or

```bash
npm install --save @yyyyu/react-native-geetest-sensebot
```

## 配置

### ios

#### 1. 自动配置(推荐)

```bash
react-native link @yyyyu/react-native-geetest-sensebot
```

如果项目**使用 Pods 管理依赖**需要在 Podfile 中添加

```ruby
pod 'React', :path => '../node_modules/react-native', :subspecs => ['Dependency']
pod 'yoga', :path => '../node_modules/react-native/ReactCommon/yoga'
```

#### 2. 手动配置

1. 使用 Xcode 打开项目，在项目依赖目录(Libraries)下添加 node_modules 中的 @yyyyu/react-native-geetest-sensebot 项目
2. 在 Linked Frameworks and Libraries 添加 libRCTGeetestSensebot.a

#### 额外配置

**手动配置和非 Pods 管理依赖情况下**需要将 **node_modules/@yyyyu/react-native-geetest-sensebot/ios/SDK/GT3Captcha.framework** 添加到 framework 依赖中

### android

#### 1. 自动配置(如果 IOS 已经运行过，不需要重复运行)

```bash
react-native link @yyyyu/react-native-geetest-sensebot
```

#### 2. 手动配置

1. 在 android/settings.gradle 文件中添加

    ```Groovy
    include ':react-native-geetest-sensebot'
    project(':react-native-geetest-sensebot').projectDir = new File(rootProject.projectDir, '../node_modules/@yyyyu/react-native-geetest-sensebot/android')
    ```

2. 在 android/app/build.gradle 文件中依赖部分添加

    ```Groovy
    dependencies {
        // other dependencies
        compile project(':react-native-geetest-sensebot')
    }
    ```

3. 在 MainApplication.java 文件中添加

    ```Java
    import com.rnlib.geetest.sensebot.ReactGeetestSensebotPackage;

    @Override
    protected List<ReactPackage> getPackages() {
        return Arrays.<ReactPackage>asList(
            // other packages
            new ReactGeetestSensebotPackage()
        );
    }
    ```

#### 额外配置

1. 在 android/build.gradle 文件中添加
    ```Groovy
    allprojects {
        repositories {
            // ...other
            flatDir {
                dirs project(':react-native-geetest-sensebot').file('libs')
            }
        }
    }
    ```

2. android/app/build.gradle 中修改构建工具版本大于 25 (buildToolsVersion >= 25)

3. AndroidManifest.xml
    ```xml
    // 如果存在 android:allowBackup="false" 则添加 tools:replace="android:allowBackup"
    <manifest xmlns:tools="http://schemas.android.com/tools">
        <application
          android:allowBackup="false"
            tools:replace="android:allowBackup">

        </application>
    </manifest>
    ```

## JS API

```javascript
import GeetestSensebot from '@yyyyu/react-native-geetest-sensebot'

const api1 = 'http://www.geetest.com/demo/gt/register-test'
const api2 = 'http://www.geetest.com/demo/gt/validate-test'

GeetestSensebot.configApi(api1, api2)
GeetestSensebot.captcha()
```

#### configApi 配置 api 请求地址

```javascript
GeetestSensebot.configApi('api1 address', 'api2 address')
```

#### captcha 进行行为认证

```javascript
GeetestSensebot.captcha({
  api1ReqReplacer: (DefaultApi1Req) => { return ModifyApi1Req },
  api1RespHandler: (Api1Resq) => { return { success: number, gt: string, challenge: string } },
  api2ReqReplacer: (DefaultApi2Req) => { return ModifyApi2Req },
  api2RespHandler: (Api2Resq) => { // do anything }
})
```

因为 api1、api2 由使用者自行配置，所以接口的请求及返回处理方式不一定按照官方实例的方式进行，所以这里提供了 4 个可选方法，用于替换 Request 以及处理 Response，关于创建 Request 及处理 Response 参考 [MDN Request](https://developer.mozilla.org/en-US/docs/Web/API/Request)、[MDN Response](https://developer.mozilla.org/en-US/docs/Web/API/Response)，同时这 4 个方法均为可选参数，不传会使用默认的方式，函数支持使用 es7 async

关于 **api1RespHandler** 特别说明，由于行为验证需要将 api1 的结果数据传递到 sdk 组件中，所以需要规定一个格式才能流程正常进行下去，api1RespHandler 返回值格式必须为
```json
{
  "success": number,
  "gt": string,
  "challenge": string
}
```

错误处理方式
```javascript
import GeetestSensebot, { GSError, ERROR_TYPE } from '@yyyyu/react-native-geetest-sensebot'
try {
  // await GeetestSensebot.captcha() ...
} catch (e) {
  if (e instanceof GSError) {
    const { errCode, errMsg } = e
    if (errCode === ERROR_TYPE.API1) {
    	// api1 出现错误
    }
    if (errCode === ERROR_TYPE.API2) {
    	// api2 出现错误
    }
    if (errCode === ERROR_TYPE.CAPTCHA) {
    	// 行为认证过程出现错误
    }
    console.error(errMsg)
    // 由于这个过程涉及多个接口，出错情况多种多样，所以报错使用过程来区分
    // 原 SDK IOS 有错误代码及描述信息，Android 只有错误代码
    // errCode 是自己定义的，errMsg IOS 使用描述信息 Android 使用错误代码
    // errMsg 参数只适用于开发，如果显示给用户建议自行定义错误描述
  }
}
```

官方 API
- API1 [http://www.geetest.com/demo/gt/register-test](http://www.geetest.com/demo/gt/register-test) GET 请求 无参数 返回 json 对象格式为
    ```json
    {
      "success": number,
      "challenge": string,
      "gt": string,
      "new_captcha": boolean
    }
    ```
- API2 [http://www.geetest.com/demo/gt/validate-test](http://www.geetest.com/demo/gt/validate-test) POST 请求 请求参数包含
    ```json
    {
      "geetest_challenge": string,
      "geetest_seccode": string,
      "geetest_validate": string
    }
    ```

#### setMaskColor 设置认证页面背景颜色 iosOnly

```javascript
GeetestSensebot.setMaskColor('color string')
```

#### enableDebug 设置是否输出调试信息 iosOnly

```javascript
GeetestSensebot.enableDebug(true)
```
