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
