IPConfig(print,print);

var print = function(ip) {
  console.log(ip);
};

function IPConfig(success, error) {

    /**
     * @ver IPConfig
     */
    var that = this;

    /**
     * @ver array
     */
    this.hosts = [];
    
    /**
     * @ver RTCPeerConnection
     */
    var RTCPeerConnection = window.webkitRTCPeerConnection || window.mozRTCPeerConnection;

    /**
     * Find the local ip address for this machine
     */
    this.init = function() {
        var rtc = new RTCPeerConnection({iceServers: []});
        rtc.createDataChannel('', {reliable: false});
        rtc.onicecandidate = function(evt) {
            if (evt.candidate) {
                that.grepSDP('a=' + evt.candidate.candidate);
            }
        };
        setTimeout(function() {
            rtc.createOffer(function(offerDesc) {
                that.grepSDP(offerDesc.sdp);
                rtc.setLocalDescription(offerDesc);
            });
        }, 500);
    };

    /**
     * Add host
     * @param ip
     * @return void
     */
    this.addHost = function(ip) {
        if (ip !== '0.0.0.0' && that.hosts.indexOf(ip) === -1) {
            that.hosts.push(ip);
            success(ip);
        }
    };

    /**
     * Pull local ip from sdp
     * @param string sdp
     * @return void
     */
    this.grepSDP = function(sdp) {
        sdp.split('\r\n').forEach(function(line) {
            if (~line.indexOf('a=candidate')) {
                var parts = line.split(' ');
                var addr = parts[4];
                var type = parts[7];
                if (type === 'host') {
                    that.addHost(addr);
                }
            } else if (~line.indexOf('c=')) {
                var parts = line.split(' ');
                that.addHost(parts[2]);
            }
        });
    };

    if (RTCPeerConnection) {
        this.init();
    } else {
        return error('RTCPeerConnection is not supported');
    }

}