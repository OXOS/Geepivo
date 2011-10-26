GoogleGadgetsEnvironmentStubs = function() {

  this.gadgets = {};

  this.gadgets.io = {
    makeRequest: jasmine.createSpy('gadgets.io.makeRequest'),

    //I don't know what values those 'constants' actually have,
    //but for now it's not relevant for my tests - I'm only asserting that they appear
    //in request params in correct places.
    ContentType: {
      DOM: 'DOM'
    },

    MethodType: {
      POST: 'POST',
      PUT: 'PUT'
    },

    RequestParameters: {
      METHOD: 'METHOD',
      HEADERS: 'HEADERS',
      CONTENT_TYPE: 'CONTENT_TYPE',
      POST_DATA: 'POST_DATA'
    }
  };

  this.gadgets['window'] = {
    adjustHeight: jasmine.createSpy('window')
  };


};
