require 'xcodeproj'

platform = ENV.fetch('NITRO_COOKIES_PLATFORM').to_sym
project = Xcodeproj::Project.new('NitroCookiesHost.xcodeproj')
host = project.new_target(:application, 'NitroCookiesHost', platform, '15.1')
tests = project.new_target(:unit_test_bundle, 'CookieTests', platform, '15.1')
host.source_build_phase.add_file_reference(project.main_group.new_file('Host.swift'))
Dir['*.swift'].sort.reject { |path| path == 'Host.swift' }.each do |path|
  tests.source_build_phase.add_file_reference(project.main_group.new_file(path))
end
tests.add_dependency(host)

[host, tests].each do |target|
  target.build_configurations.each do |config|
    config.build_settings.merge!({
      'PRODUCT_BUNDLE_IDENTIFIER' => "dev.nitrocookies.#{target.name}",
      'GENERATE_INFOPLIST_FILE' => 'YES',
      'INFOPLIST_KEY_UIApplicationSceneManifest_Generation' => 'YES',
      'SWIFT_VERSION' => '5.0',
      'CLANG_CXX_LANGUAGE_STANDARD' => 'c++20',
      'SWIFT_OBJC_INTEROP_MODE' => 'objcxx',
      'CODE_SIGNING_ALLOWED' => 'NO'
    })
  end
end
tests.build_configurations.each do |config|
  config.build_settings['TEST_HOST'] = '$(BUILT_PRODUCTS_DIR)/NitroCookiesHost.app/NitroCookiesHost'
  config.build_settings['BUNDLE_LOADER'] = '$(TEST_HOST)'
  # The exported Swift/C++ interface imports Nitro's private conversion headers.
  config.build_settings['HEADER_SEARCH_PATHS'] = [
    '$(inherited)',
    '$(PODS_ROOT)/Headers/Private/NitroModules',
    '$(PODS_ROOT)/Headers/Private/NitroCookies'
  ]
end
project.save

scheme = Xcodeproj::XCScheme.new
scheme.add_build_target(host)
scheme.add_test_target(tests)
scheme.set_launch_target(host)
scheme.save_as(project.path, 'NitroCookiesHost', true)
