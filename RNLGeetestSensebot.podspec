require 'json'

package = JSON.parse(File.read(File.join(__dir__, 'package.json')))

Pod::Spec.new do |s|
  s.name                = 'RNLGeetestSensebot'
  s.version             = package['version']
  s.summary             = package['description']
  s.description         = package['description']
  s.license             = package['license']
  s.author              = { package['author'] => 'g592842897@gmail.com' }
  s.homepage            = package['homepage']
  s.source              = { :git => package['repository']['url'], :tag => package['version'] }

  s.requires_arc        = true
  s.platform            = :ios, '8.0'
  s.source_files        = 'ios/RNLGeetestSensebot.{h,m}'
  s.vendored_frameworks = 'ios/SDK/GT3Captcha.framework'
  s.resource            = 'ios/SDK/GT3Captcha.bundle'
  s.framework           = 'JavaScriptCore', 'WebKit'
  s.pod_target_xcconfig = { 'HEADER_SEARCH_PATHS' => '$(BUILT_PRODUCTS_DIR)/../include' }
end
