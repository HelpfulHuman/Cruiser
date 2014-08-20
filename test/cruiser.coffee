chai    = require('chai').should()
Cruiser = require '../lib/cruiser.js'

describe 'cruiser', ->
  it 'should instantiate and start server', ->
    cruiserObj = new Cruiser()
    cruiserObj.server().should.equal true