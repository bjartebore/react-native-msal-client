require "json"

Pod::Spec.new do |s|
  # NPM package specification
  package = JSON.parse(File.read(File.join(File.dirname(__FILE__), "package.json")))

  s.name         = "RNMsalClient"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.homepage     = "https://github.com/bjartebore/react-native-msal-client"
  s.license      = "MIT"
  s.author       = { package["author"]["name"] => package["author"]["email"] }
  s.platform     = :ios, "7.0"
  s.source       = { :git => "https://github.com/bjartebore/react-native-msal-client", :tag => "#{s.version}" }
  s.source_files = "ios/**/*.{h,m}"
  s.dependency "React"
  s.dependency "MSAL", "0.2.3"
end