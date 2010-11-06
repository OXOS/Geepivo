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
require 'rubygems'
require 'oauth'
require 'rexml/document'

# Simple helper around the ruby oauth library for making Google Data API requests
module Google
  
  class Client
    attr_accessor :oauth_token
    attr_accessor :version
    
    def initialize(token, version = '1.0')
      @token = token
      @version = version
    end
  
    def get(base, query_parameters)
      make_request(:get, url(base, query_parameters))
    end
    
    def make_request(method, url)
      response = @token.request(method, url, { 'GData-Version' => version })
      if response.is_a?(Net::HTTPFound)
        url = response['Location']
        return make_request(method, response['Location'])
      end
      return unless response.is_a?(Net::HTTPSuccess)
      REXML::Document.new(response.body)
    end

    private  
        
    def url(base, query_parameters={})
      url = base
      unless query_parameters.empty?
        url += '?'
        query_parameters.each {|key, value| url += "#{CGI::escape(key)}=#{CGI::escape(value)}&"}
        url.chop!
      end
      url
    end
  end

end

