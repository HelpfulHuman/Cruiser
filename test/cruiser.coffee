chai    = require('chai').should()
cruiser = require '../lib/cruiser.js'

describe 'cruiser', ->
  it 'should instantiate and server method should return true', ->
    cruiserObj = new cruiser
    cruiserObj.server().should.be true