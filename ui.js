// Generated by CoffeeScript 1.7.1
var App, Blurb, Divider, DownloadLinks, EleView, FileInput, Footer, GPXView, HRLine, TinySummary, a, button, div, em, form, g, h1, h2, input, nicetime, p, path, rect, span, svg, text, _ref;

_ref = React.DOM, div = _ref.div, form = _ref.form, input = _ref.input, p = _ref.p, h1 = _ref.h1, h2 = _ref.h2, a = _ref.a, button = _ref.button, svg = _ref.svg, rect = _ref.rect, path = _ref.path, g = _ref.g, span = _ref.span, text = _ref.text, em = _ref.em;

App = React.createClass({
  getInitialState: function() {
    return {
      xml: null,
      cutoff: null,
      updateCutoff: this.updateCutoff,
      updateXML: this.updateXML
    };
  },
  updateCutoff: function(newCutoff) {
    return this.setState({
      cutoff: newCutoff
    });
  },
  updateXML: function(xml) {
    return this.setState({
      xml: xml
    });
  },
  render: function() {
    return div({
      className: 'app'
    }, [h1({}, "GPX Splitter"), this.state.xml == null ? FileInput(this.state) : void 0, this.state.xml == null ? Blurb() : void 0, this.state.xml != null ? GPXView(this.state) : void 0, this.state.cutoff != null ? DownloadLinks(this.state) : void 0, Footer()]);
  }
});

FileInput = React.createClass({
  getInitialState: function() {
    return {
      over: false
    };
  },
  handleFile: function(e) {
    var files, reader;
    e.preventDefault();
    reader = new FileReader();
    reader.onload = (function(_this) {
      return function(evt) {
        var parser, xml;
        parser = new DOMParser();
        xml = parser.parseFromString(evt.target.result, 'text/xml');
        return _this.props.updateXML(xml);
      };
    })(this);
    files = e.target.files || e.dataTransfer.files;
    return reader.readAsText(files[0]);
  },
  timeout: null,
  handleOver: function(e) {
    e.preventDefault();
    if (!this.state.over) {
      this.setState({
        over: true
      });
    }
    clearTimeout(this.timeout);
    return this.timeout = setTimeout(((function(_this) {
      return function() {
        return _this.setState({
          over: false
        });
      };
    })(this)), 200);
  },
  componentWillUnmount: function() {
    return clearTimeout(this.timeout);
  },
  render: function() {
    return div({
      className: 'fileInput' + (this.state.over ? " over" : ""),
      onDrop: this.handleFile,
      onDragOver: this.handleOver
    }, [
      p({}, "Drag and drop a .gpx file"), p({}, [
        "or choose from your computer", input({
          type: 'file',
          ref: 'inp',
          onChange: this.handleFile
        })
      ])
    ]);
  }
});

GPXView = React.createClass({
  getInitialState: function() {
    return {
      dividerX: 300
    };
  },
  render: function() {
    var avgLat, avgLon, c, data, ele, hr, i, lat, lines, lon, maxEle, maxHR, name, point, points, t, timestamp, trkpts, x, _i, _ref1, _ref2, _ref3;
    this.start = Date.parse(this.props.xml.querySelector('trkseg trkpt:first-child time').innerHTML);
    this.end = Date.parse(this.props.xml.querySelector('trkseg trkpt:last-child time').innerHTML);
    data = {};
    trkpts = this.props.xml.getElementsByTagName('trkpt');
    _ref1 = [-Infinity, -Infinity], maxEle = _ref1[0], maxHR = _ref1[1];
    avgLat = 0;
    avgLon = 0;
    for (i = _i = 0, _ref2 = trkpts.length - 1; 0 <= _ref2 ? _i <= _ref2 : _i >= _ref2; i = 0 <= _ref2 ? ++_i : --_i) {
      point = trkpts[i];
      timestamp = Date.parse(point.getElementsByTagName('time')[0].innerHTML);
      data[timestamp - this.start] = {
        lat: lat = point.getAttribute('lat'),
        lon: lon = point.getAttribute('lon'),
        ele: ele = point.getElementsByTagName('ele')[0].innerHTML,
        hr: hr = (_ref3 = point.getElementsByTagName('hr')[0]) != null ? _ref3.innerHTML : void 0
      };
      avgLat += lat / trkpts.length;
      avgLon += lon / trkpts.length;
      maxEle = Math.max(maxEle, ele);
      maxHR = Math.max(maxHR, hr);
    }
    name = this.props.xml.querySelector('name').innerHTML;
    c = (this.state.dividerX != null ? this.state.dividerX * (this.end - this.start) / 800 : this.props.cutoff != null ? this.props.cutoff - this.start : Infinity);
    lines = {
      line1: {
        points: (function() {
          var _results;
          _results = [];
          for (t in data) {
            x = data[t];
            if (t < c) {
              _results.push({
                latitude: x.lat,
                longitude: x.lon
              });
            }
          }
          return _results;
        })(),
        strokeColor: '#FF4136',
        strokeWeight: 3
      },
      line2: {
        points: (function() {
          var _results;
          _results = [];
          for (t in data) {
            x = data[t];
            if (t >= c) {
              _results.push({
                latitude: x.lat,
                longitude: x.lon
              });
            }
          }
          return _results;
        })(),
        strokeColor: '#0074D9',
        strokeWeight: 3
      }
    };
    points = lines.line2.points[0] != null ? [lines.line2.points[0]] : [];
    return div({
      className: 'GPXView'
    }, [
      h2({}, name), Map({
        latitude: avgLat,
        longitude: avgLon,
        zoom: 13,
        width: 800,
        height: 300,
        lines: lines,
        points: points
      }), svg({
        height: 170,
        width: 800,
        onMouseMove: this.handleMove,
        onMouseLeave: this.handleLeave,
        onClick: this.onClick,
        ref: 'svg'
      }, [
        !isNaN(maxHR) ? HRLine({
          maxTime: this.end,
          maxHR: maxHR,
          start: this.start,
          data: data
        }) : void 0, EleView({
          maxTime: this.end,
          maxEle: maxEle,
          start: this.start,
          data: data
        }), Divider({
          start: this.start,
          end: this.end,
          cutoff: this.props.cutoff,
          dividerX: this.state.dividerX
        })
      ]), this.props.cutoff == null ? p(null, "Click above to split your activity.") : void 0, this.props.cutoff == null ? p(null, a({
        href: '#',
        onClick: this.startAgain
      }, "back")) : void 0
    ]);
  },
  startAgain: function() {
    this.props.updateCutoff(null);
    return this.props.updateXML(null);
  },
  handleMove: function(e) {
    rect = this.refs.svg.getDOMNode().getBoundingClientRect();
    return this.setState({
      dividerX: e.clientX - rect.left
    });
  },
  handleLeave: function(e) {
    return this.setState({
      dividerX: null
    });
  },
  onClick: function(e) {
    var c;
    c = this.state.dividerX * (this.end - this.start) / 800 + this.start;
    return this.props.updateCutoff(c);
  }
});

Divider = React.createClass({
  render: function() {
    var c, cutoffX, elems;
    elems = [];
    if (this.props.cutoff != null) {
      cutoffX = (this.props.cutoff - this.props.start) * (800 / (this.props.end - this.props.start));
      elems.push(path({
        className: 'cutoff',
        d: "M " + cutoffX + " 0 " + cutoffX + " 170"
      }));
    }
    if (this.props.dividerX != null) {
      elems.push(React.DOM.rect({
        x: this.props.dividerX,
        y: 0,
        width: 50,
        height: 27,
        fill: 'rgba(247,247,247,0.9)'
      }));
      elems.push(path({
        className: 'cursor',
        d: "M " + this.props.dividerX + " 0 " + this.props.dividerX + " 170"
      }));
      c = this.props.dividerX * (this.props.end - this.props.start) / 800;
      elems.push(text({
        x: this.props.dividerX + 10,
        y: 17
      }, nicetime(c)));
    }
    return g({}, elems);
  }
});

EleView = React.createClass({
  render: function() {
    var duration, elePath, obj, sfx, sfy, t;
    duration = this.props.maxTime - this.props.start;
    sfx = 800 / duration;
    sfy = this.props.maxEle > 170 ? 170 / this.props.maxEle : 1;
    elePath = ("M 0 " + this.props.data[0].ele + " L ") + ((function() {
      var _ref1, _results;
      _ref1 = this.props.data;
      _results = [];
      for (t in _ref1) {
        obj = _ref1[t];
        _results.push(t * sfx + " " + obj.ele * -sfy);
      }
      return _results;
    }).call(this)).join(' ') + " 800 0 Z";
    return g({
      stroke: 'none',
      fill: 'rgba(0,0,0,0.15)',
      transform: "translate(0,170)"
    }, path({
      d: elePath
    }));
  }
});

HRLine = React.createClass({
  render: function() {
    var duration, hrline, obj, sfx, sfy, t, _ref1;
    duration = this.props.maxTime - this.props.start;
    sfx = 800 / duration;
    sfy = 170 / this.props.maxHR;
    hrline = "M 0 " + this.props.data[0].hr + " L";
    _ref1 = this.props.data;
    for (t in _ref1) {
      obj = _ref1[t];
      hrline += " " + (t * sfx) + " " + (obj.hr * -sfy);
    }
    return g({
      stroke: '#dd0447',
      strokeWidth: '1.5',
      fill: 'none',
      transform: "translate(0,170)"
    }, path({
      d: hrline
    }));
  }
});

DownloadLinks = React.createClass({
  getInitialState: function() {
    return {
      downloadedForCutoff: null
    };
  },
  render: function() {
    var blob1, blob2, firstTime, newXMLString1, newXMLString2, serializer, url1, url2, xml1, xml2;
    xml1 = this.props.xml.cloneNode(true);
    xml2 = this.props.xml.cloneNode(true);
    [].forEach.call(xml1.querySelectorAll('trkseg time'), (function(_this) {
      return function(t) {
        if (Date.parse(t.innerHTML) >= _this.props.cutoff) {
          return t.parentNode.remove();
        }
      };
    })(this));
    xml1.querySelector('trk name').innerHTML += " (part 1)";
    [].forEach.call(xml2.querySelectorAll('trkseg time'), (function(_this) {
      return function(t) {
        if (Date.parse(t.innerHTML) < _this.props.cutoff) {
          return t.parentNode.remove();
        }
      };
    })(this));
    xml2.querySelector('trk name').innerHTML += " (part 2)";
    firstTime = xml2.querySelector('trk time').innerHTML;
    xml2.querySelector('metadata time').innerHTML = firstTime;
    serializer = new XMLSerializer();
    newXMLString1 = serializer.serializeToString(xml1);
    blob1 = new Blob([newXMLString1]);
    url1 = window.URL.createObjectURL(blob1);
    newXMLString2 = serializer.serializeToString(xml2);
    newXMLString2 = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" + newXMLString2;
    blob2 = new Blob([newXMLString2]);
    url2 = window.URL.createObjectURL(blob2);
    return div({
      className: 'downloadLinks'
    }, [
      TinySummary({
        xml: xml1,
        url: url1,
        filename: 'part1.gpx',
        handleClick: this.handleClick
      }), " ", TinySummary({
        xml: xml2,
        url: url2,
        filename: 'part2.gpx',
        handleClick: this.handleClick
      }), this.state.downloadedForCutoff === this.props.cutoff ? p(null, "You can now ", a({
        href: 'http://www.strava.com/upload/select',
        target: '_blank'
      }, "upload these files to Strava"), " or ", a({
        href: '#',
        onClick: this.startAgain
      }, "start again"), ".") : void 0, this.state.downloadedForCutoff === this.props.cutoff ? p(null, "Don't forget to delete the old activity!") : void 0
    ]);
  },
  handleClick: function() {
    return this.setState({
      downloadedForCutoff: this.props.cutoff
    });
  },
  startAgain: function() {
    this.props.updateCutoff(null);
    return this.props.updateXML(null);
  }
});

nicetime = function(duration) {
  var hours, minutes, pad, seconds;
  seconds = Math.floor(duration / 1000);
  minutes = seconds / 60;
  hours = Math.floor(minutes / 60);
  pad = function(x) {
    if (x < 10) {
      return "0" + x;
    } else {
      return x;
    }
  };
  return (hours > 0 ? hours + ":" : "") + Math.floor(minutes) + ":" + pad(seconds % 60);
};

TinySummary = React.createClass({
  render: function() {
    var end, name, start;
    start = Date.parse(this.props.xml.querySelector('trkseg trkpt:first-child time').innerHTML);
    end = Date.parse(this.props.xml.querySelector('trkseg trkpt:last-child time').innerHTML);
    name = this.props.xml.querySelector('name').innerHTML;
    return p({
      className: 'tinySummary'
    }, [
      span({
        className: 'duration'
      }, nicetime(end - start)), span({
        className: 'label'
      }, "duration"), a({
        href: this.props.url,
        className: 'dl',
        download: this.props.filename,
        onClick: this.props.handleClick
      }, "Download " + this.props.filename)
    ]);
  }
});

Blurb = React.createClass({
  render: function() {
    return div({
      className: 'blurb'
    }, p(null, em(null, "Use this tool to split Strava activities into separate parts.")), p(null, "For example, if you've just done a triathlon, you might want to analyse each\nphase as a separate activity."), p(null, "You'll need to export the GPX file from your Strava activity - click the wrench icon. You can then split it up and then upload the two parts.  "));
  }
});

Footer = React.createClass({
  render: function() {
    return p({
      className: 'footer'
    }, "made for fun by ", a({
      href: 'http://github.com/iamdanfox/gpxsplitter'
    }, "iamdanfox"));
  }
});
