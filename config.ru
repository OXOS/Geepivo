require 'rubygems'
require 'bundler'

ENV['RACK_ENV'] ||= 'development'
Bundler.require :common, ENV['RACK_ENV'].to_sym

require 'geepivoapp'

run Sinatra::Application
