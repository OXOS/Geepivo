require "rubygems"
require 'rack/contrib'
require 'rack-rewrite'

use Rack::Static, :urls => ['/images'], :root => "public"
use Rack::ETag
use Rack::Rewrite do
  rewrite '/', '/index.html'
end
run Rack::Directory.new('public')



#require 'rubygems'
#require 'bundler'
#
#Bundler.setup
#
#require 'sinatra'
#require 'gapps_openid'
#require 'rack/openid'
#require 'google_util'
#require 'oauth'
#require 'net/imap'
#require 'pivotal-tracker'
#
#configure(:development) do |c|
#  require "sinatra/reloader"
#  require "ruby-debug"
#end
#
#require 'hello'
#run Sinatra::Application

