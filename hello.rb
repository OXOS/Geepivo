# Copyright 2010 Google Inc.
#
# Licensed to the Apache Software Foundation (ASF) under one
# or more contributor license agreements. See the NOTICE file
# distributed with this work for additional information
# regarding copyright ownership. The ASF licenses this file
# to you under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance
# with the License. You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing,
# software distributed under the License is distributed on an
# "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
# KIND, either express or implied. See the License for the
# specific language governing permissions and limitations
# under the License.
#use Rack::Session::Cookie
#enable :sessions

#use Rack::OpenID

CONSUMER_KEY		= ENV['CONSUMER_KEY']
CONSUMER_SECRET = ENV['CONSUMER_SECRET']

require 'rubygems'
require 'bundler'

require 'gapps_openid'
require 'google_util'
require 'oauth'
require 'gmail_xoauth'
require 'ruby-debug'
require 'net/imap'

module GmailXoauth
  module OauthString
  
  private
    
    #
    # Builds the "oauth protocol parameter string". See http://code.google.com/apis/gmail/oauth/protocol.html#sasl
    # 
    #   +request_url+ https://mail.google.com/mail/b/user_name@gmail.com/{imap|smtp}/
    #   +oauth_params+ contains the following keys:
    #     * :consumer_key (default 'anonymous')
    #     * :consumer_secret (default 'anonymous')
    #     * :token (mandatory)
    #     * :token_secret (mandatory)
    def build_2_legged_oauth_string(request_url, user, oauth_params = {})
      oauth_request_params = {
        "oauth_consumer_key"     => oauth_params[:consumer_key],
        'oauth_nonce'            => OAuth::Helper.generate_key,
        "oauth_signature_method" => 'HMAC-SHA1',
        'oauth_timestamp'        => OAuth::Helper.generate_timestamp,
        'oauth_version'          => '1.0',
      }
      
      request = OAuth::RequestProxy.proxy(
         'method'     => 'GET',
         'uri'        => request_url,
         'parameters' => oauth_request_params.merge({"xoauth_requestor_id" => user})
      )
      
      oauth_request_params['oauth_signature'] =
        OAuth::Signature.sign(
          request,
          :consumer_secret => oauth_params[:consumer_secret]
        )
      
      # Inspired from OAuth::RequestProxy::Base#oauth_header
			oauth_request_params.map { |k,v| "#{k}=\"#{OAuth::Helper.escape(v)}\"" }.sort.join(',')
    end
    
  end
end

module GmailXoauth
  class ImapXoauthAuthenticator
    
    def process(data)
      build_sasl_client_request(@request_url, @oauth_string)
    end
    
  private
    
    # +user+ is an email address: roger@gmail.com
    # +password+ is a hash of oauth parameters, see +build_oauth_string+
    def initialize(user, password)
			@request_url, @auth_string = if password[:two_legged]
				[ "https://mail.google.com/mail/b/#{user}/imap/?xoauth_requestor_id=#{user}",
					build_2_legged_oauth_string(@request_url, user, password) ]
			else
				[ "https://mail.google.com/mail/b/#{user}/imap/",
					build_oauth_string(@request_url, user, password) ]
			end
    end
  end
end

Net::IMAP.add_authenticator('XOAUTH', GmailXoauth::ImapXoauthAuthenticator)


imap = Net::IMAP.new('imap.googlemail.com', 993, usessl = true, certs = nil, verify = false)
imap.send(:debug=,true)
imap.authenticate 'XOAUTH', 'daniel@oxos.pl', :two_legged => true, :consumer_key => CONSUMER_KEY, :consumer_secret => CONSUMER_SECRET

messages_count = imap.status('INBOX', ['MESSAGES'])['MESSAGES']
puts "Seeing #{messages_count} messages in INBOX"


#helpers do
#	include Rack::Utils
#
#  def require_authentication    
#    redirect '/login' unless authenticated?
#  end 
#  
#  def authenticated?
#    !session["openid"].nil?
#  end
#  
#  def url_for(path)
#    url = request.scheme + "://"
#    url << request.host
#
#    scheme, port = request.scheme, request.port
#    if scheme == "https" && port != 443 ||
#        scheme == "http" && port != 80
#      url << ":#{port}"
#    end
#    url << path
#    url
#  end
#end
#
#before do
#  @openid = session["openid"]
#  @user_attrs = session["user_attributes"]
#end
#
## Clear the session
#get '/logout' do
#  session.clear
#  redirect '/login'
#end
#
## Handle login form & navigation links from Google Apps
#get '/login' do
#  if params["openid_identifier"].nil?
#    # No identifier, just render login form
#    erb :login
#  else
#    # Have provider identifier, tell rack-openid to start OpenID process
#    headers 'WWW-Authenticate' => Rack::OpenID.build_header(
#      :identifier => params["openid_identifier"],
#      :required => ["http://axschema.org/contact/email", 
#                    "http://axschema.org/namePerson/first",
#                    "http://axschema.org/namePerson/last"],
#      :return_to => url_for('/openid/complete'),
#      :method => 'post'
#      )
#    halt 401, 'Authentication required.'
#  end
#end
#
## Handle the response from the OpenID provider
#post '/openid/complete' do
#  resp = request.env["rack.openid.response"]
#  if resp.status == :success
#    session["openid"] = resp.display_identifier
#    ax = OpenID::AX::FetchResponse.from_success_response(resp)
#    session["user_attributes"] = {
#      :email => ax.get_single("http://axschema.org/contact/email"),
#      :first_name => ax.get_single("http://axschema.org/namePerson/first"),
#      :last_name => ax.get_single("http://axschema.org/namePerson/last")     
#    }
#    redirect '/mail'
#  else
#    "Error: #{resp.status}"
#  end
#end
#
#get '/mail' do
#  require_authentication
#  
#  consumer = OAuth::Consumer.new(CONSUMER_KEY, CONSUMER_SECRET)
#  token = OAuth::AccessToken.new(consumer)
#	token_secret = consumer.secret
#
#  #oauth_consumer = OAuth::Consumer.new(CONSUMER_KEY, CONSUMER_SECRET)
#  #access_token = OAuth::AccessToken.new(oauth_consumer)
#
#	imap = Net::IMAP.new('imap.googlemail.com', 993, usessl = true, certs = nil, verify = false)
#	imap.send(:debug=,true)
#	imap.authenticate 'XOAUTH', 'daniel@oxos.pl', {}
#		#:xoauth_requestor_id	=> @user_attrs[:email],
#	  #:consumer_key					=> CONSUMER_KEY,
#	  #:consumer_secret			=>  CONSUMER_SECRET
#
#	messages_count = imap.status('INBOX', ['MESSAGES'])['MESSAGES']
#	"Seeing #{messages_count} messages in INBOX"
#end
#
## Display upcoming calendar appointments
#get '/cal' do
#  require_authentication
#  
#  oauth_consumer = OAuth::Consumer.new(CONSUMER_KEY, CONSUMER_SECRET)
#  access_token = OAuth::AccessToken.new(oauth_consumer)
#  client = Google::Client.new(access_token, '2.0');
#  #calendar_url = "http://www.google.com/calendar/feeds/oxos.pl_kaht1mepb6gcgkb5orsq91po88%40group.calendar.google.com/public/basic"
#	calendar_url = "https://www.google.com/calendar/feeds/default/private/full"
#  feed = client.get(calendar_url, {
#    'xoauth_requestor_id' => @user_attrs[:email],
#    'orderby' => 'starttime',
#    'singleevents' => 'true',
#    'sortorder' => 'a',
#    'start-min' => Time.now.strftime('%Y-%m-%dT%H:%M:%S')
#  })
#  throw :halt, [500, "Unable to query calendar feed"] if feed.nil?
#
#  @events = []
#  feed.elements.each('//entry') do |entry|
#    @events << {
#      :title => entry.elements["title"].text,
#      :content => entry.elements["content"].text,
#      :start_time => entry.elements["gd:when"].attribute("startTime").value,
#      :end_time => entry.elements["gd:when"].attribute("endTime").value
#    }
#  end
#  erb :events
#end
#
## Generate a manifest for this deployment
#get '/manifest.xml' do
#  content_type 'text/xml'
#  erb :manifest, :layout => false
#end
#
#get '/' do
#  "Hello World"
#end
#
## Catch-all route
#get '/*' do
#  redirect '/cal'
#end





