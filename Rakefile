require 'rake'
require 'rake/testtask'
require 'rake/rdoctask'

require 'barista'
require 'barista/rake_task'
Barista.configure do |config|
  config.root = 'coffeescripts'
end
Barista::RakeTask.new do |t|
  t.namespace = :barista
  t.task_name = :brew
  #t.rails     = true
end

begin
  require 'jasmine'
  load 'jasmine/tasks/jasmine.rake'
rescue LoadError
  task :jasmine do
    abort "Jasmine is not available. In order to run jasmine, you must: (sudo) gem install jasmine"
  end
end
