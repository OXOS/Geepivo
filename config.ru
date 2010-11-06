require 'rubygems'
require 'bundler'

#Bundler.require
Bundler.setup

require 'sinatra'
require 'gapps_openid'
require 'rack/openid'
require 'google_util'

require 'hello'
run Sinatra::Application


