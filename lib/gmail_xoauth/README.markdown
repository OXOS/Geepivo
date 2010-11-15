# gmail_xoauth

Get access to [Gmail IMAP and STMP via OAuth](http://code.google.com/apis/gmail/oauth), using the standard Ruby Net libraries.

The gem only supports 3-legged OAuth. If you need [2-legged OAuth feel](http://code.google.com/apis/accounts/docs/OAuth.html) free to fork!

## Install

    $ gem install gmail_xoauth

## Usage

### Get your OAuth tokens

For testing, you can generate and validate your OAuth tokens thanks to the awesome [xoauth.py tool](http://code.google.com/p/google-mail-xoauth-tools/wiki/XoauthDotPyRunThrough).

    $ python xoauth.py --generate_oauth_token --user=myemail@gmail.com

### IMAP

For your tests, Gmail allows to set 'anonymous' as the consumer key and secret.

    require 'gmail_xoauth'
    imap = Net::IMAP.new('imap.gmail.com', 993, usessl = true, certs = nil, verify = false)
    imap.authenticate('XOAUTH', 'myemail@gmail.com',
      :consumer_key => 'anonymous',
      :consumer_secret => 'anonymous',
      :token => '4/nM2QAaunKUINb4RrXPC55F-mix_k',
      :token_secret => '41r18IyXjIvuyabS/NDyW6+m'
    )
    messages_count = imap.status('INBOX', ['MESSAGES'])['MESSAGES']
    puts "Seeing #{messages_count} messages in INBOX"

Note that the [Net::IMAP#login](http://www.ruby-doc.org/core/classes/Net/IMAP.html#M004191) method does not use support custom authenticators, so you have to use the [Net::IMAP#authenticate](http://www.ruby-doc.org/core/classes/Net/IMAP.html#M004190) method.

### SMTP

For your tests, Gmail allows to set 'anonymous' as the consumer key and secret.

    require 'gmail_xoauth'
    smtp = Net::SMTP.new('smtp.gmail.com', 587)
    smtp.enable_starttls_auto
    secret = {
      :consumer_key => 'anonymous',
      :consumer_secret => 'anonymous',
      :token => '4/nM2QAaunKUINb4RrXPC55F-mix_k',
      :token_secret => '41r18IyXjIvuyabS/NDyW6+m'
    }
    smtp.start('gmail.com', 'myemail@gmail.com', secret, :xoauth)
    smtp.finish

Note that +Net::SMTP#enable_starttls_auto+ is not defined in Ruby 1.8.6.

## Compatibility

Tested on Ruby MRI 1.8.6, 1.8.7 and 1.9.1. Feel free to send me a message if you tested this code with other implementations of Ruby.

The only external dependency is the [oauth gem](http://rubygems.org/gems/oauth).

## Note on Patches/Pull Requests
 
* Fork the project.
* Make your feature addition or bug fix.
* Add tests for it. This is important so I don't break it in a
  future version unintentionally.
* Commit, do not mess with rakefile, version, or history.
  (if you want to have your own version, that is fine but bump version in a commit by itself I can ignore when I pull)
* Send me a pull request. Bonus points for topic branches.

## Copyright

Copyright (c) 2010 Silentale SAS. See LICENSE for details.
