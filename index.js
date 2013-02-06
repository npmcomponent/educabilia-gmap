'use strict'

var noop = function() { }
  , Emitter = require('emitter')

function GMap(element) {
  this.element = element
  this.markers = []
  this.markerOptions = {}
}

GMap.prototype.addMarkers = function(pairs) {
  var i; for (i = 0; i < pairs.length; i++) {
    this.markers.push(pairs[i])
  }
}

GMap.prototype.init = function(done) {
  done = done || noop

  if (this._initialized) done()
  else {
    var jsonp = require('jsonp')
      , gmap = this

    jsonp('http://maps.googleapis.com/maps/api/js?v=3.exp&sensor=false', {}, function() {
      gmap._initialized = true
      gmap._initMap()
      gmap._initMarkers()
      done()
    })
  }
}

GMap.prototype._initMap = function() {
  this.map = new google.maps.Map(this.element, {
    mapTypeId: 'roadmap',
    streetViewControl: false
  })

  this.map.fitBounds(this.getBounds())
}

GMap.prototype._initMarkers = function() {
  var gmap = this

  var i; for (i = 0; i < this.markers.length; i++) {
    var pair = this.markers[i]
      , options = {}

    for (var key in this.markerOptions) {
      if (this.markerOptions.hasOwnProperty(key)) options[key] = this.markerOptions[key]
    }

    options.position = new google.maps.LatLng(pair[0], pair[1])
    options.map = this.map

    var marker = new google.maps.Marker(options)

    google.maps.event.addListener(marker, 'click', (function(i) {
      return function() { gmap.emit('marker.click', i) }
    })(i))
  }
}

GMap.prototype.getBounds = function() {
  var bounds = new google.maps.LatLngBounds()

  var i; for (i = 0; i < this.markers.length; i++) {
    var pair = this.markers[i]

    bounds.extend(new google.maps.LatLng(pair[0], pair[1]))
  }

  return bounds
}

Emitter(GMap.prototype)

module.exports = GMap
