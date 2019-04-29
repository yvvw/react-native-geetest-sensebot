require 'json'

package_json = JSON.parse(File.read(File.join(__dir__, 'package.json')))

Pod::Spec.new do |s|
  s.name                = 'RNLGeetestSensebot'
  s.version             = package_json["version"]
  s.author              = { package_json['author']['name'] => package_json['author']['email'] }
  s.license             = { :type => package_json['license'] }
  s.homepage            = package_json['homepage']
  s.source              = { :git => package_json['repository']['url'], :tag => "v#{package_json['version']}" }
  s.summary             = package_json['description']

  s.platform            = :ios, '8.0'
  s.source_files        = 'ios/RNLGeetestSensebot.{h,m}'
  s.vendored_frameworks = 'ios/SDK/GT3Captcha.framework'
  s.resource            = 'ios/SDK/GT3Captcha.bundle'
  s.framework           = 'JavaScriptCore', 'WebKit'
  s.dependency 'React'
end
