require 'rake'
require 'rake/testtask'
require 'rake/rdoctask'
require 'ruby-debug'
require 'coffee-script'

begin
  require 'jasmine'
  load 'jasmine/tasks/jasmine.rake'
rescue LoadError
  task :jasmine do
    abort "Jasmine is not available. In order to run jasmine, you must: (sudo) gem install jasmine"
  end
end

FileList['coffeescripts/*.coffee'].each do |input_file|
  base_name = /coffeescripts\/(.*)\.coffee$/.match(input_file)[1]
  output_file = "javascripts/#{base_name}.js"

  desc "Compile #{input_file} to #{output_file}"
  file output_file => input_file do |t|
    output = ::CoffeeScript.compile File.read(t.prerequisites[0])
    File.open(t.name,"w") do |file|
      file.write(output)
    end
  end
end
