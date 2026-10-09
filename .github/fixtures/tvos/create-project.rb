require 'xcodeproj'

project = Xcodeproj::Project.new('NitroCookiesTV.xcodeproj')
host = project.new_target(:application, 'NitroCookiesTV', :tvos, '15.1')
tests = project.new_target(:unit_test_bundle, 'CookieTests', :tvos, '15.1')
host.source_build_phase.add_file_reference(project.main_group.new_file('Host.swift'))
tests.source_build_phase.add_file_reference(project.main_group.new_file('CookieTests.swift'))
tests.add_dependency(host)

[host, tests].each do |target|
  target.build_configurations.each do |config|
    config.build_settings.merge!({
      'PRODUCT_BUNDLE_IDENTIFIER' => "dev.nitrocookies.#{target.name}",
      'GENERATE_INFOPLIST_FILE' => 'YES',
      'SWIFT_VERSION' => '5.0',
      'CLANG_CXX_LANGUAGE_STANDARD' => 'c++20',
      'SWIFT_OBJC_INTEROP_MODE' => 'objcxx',
      'CODE_SIGNING_ALLOWED' => 'NO'
    })
  end
end
tests.build_configurations.each do |config|
  config.build_settings['TEST_HOST'] = '$(BUILT_PRODUCTS_DIR)/NitroCookiesTV.app/NitroCookiesTV'
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
scheme.save_as(project.path, 'NitroCookiesTV', true)
