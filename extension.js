/* -*- mode: js2; js2-basic-offset: 4; indent-tabs-mode: nil -*- */
const Gettext = imports.gettext.domain('gnome-shell-extensions');
const _ = Gettext.gettext;

const Gio = imports.gi.Gio;
const GLib = imports.gi.GLib;
const Grl = imports.gi.Grl;
const Shell = imports.gi.Shell;
const Soup = imports.gi.Soup;
const St = imports.gi.St;

const Lang = imports.lang;
const Main = imports.ui.main;
const Mainloop = imports.mainloop;
const Params = imports.misc.params;
const Search = imports.ui.search;
const Util = imports.misc.util;

/**
*
*  Secure Hash Algorithm (SHA1)
*  http://www.webtoolkit.info/
*
**/

function SHA1 (msg) {

    function rotate_left(n,s) {
        var t4 = ( n<<s ) | (n>>>(32-s));
        return t4;
    };

    function lsb_hex(val) {
        var str="";
        var i;
        var vh;
        var vl;

        for( i=0; i<=6; i+=2 ) {
            vh = (val>>>(i*4+4))&0x0f;
            vl = (val>>>(i*4))&0x0f;
            str += vh.toString(16) + vl.toString(16);
        }
        return str;
    };
    
    function cvt_hex(val) {
        var str="";
        var i;
        var v;
        
        for( i=7; i>=0; i-- ) {
            v = (val>>>(i*4))&0x0f;
            str += v.toString(16);
        }
        return str;
    };
    
    
    function Utf8Encode(string) {
        string = string.replace(/\r\n/g,"\n");
        var utftext = "";
        
        for (var n = 0; n < string.length; n++) {
            
            var c = string.charCodeAt(n);
            
            if (c < 128) {
                utftext += String.fromCharCode(c);
            }
            else if((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            }
            else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }
            
        }
        
        return utftext;
    };
    
    var blockstart;
    var i, j;
    var W = new Array(80);
    var H0 = 0x67452301;
    var H1 = 0xEFCDAB89;
    var H2 = 0x98BADCFE;
    var H3 = 0x10325476;
    var H4 = 0xC3D2E1F0;
    var A, B, C, D, E;
    var temp;
    
    msg = Utf8Encode(msg);
    
    var msg_len = msg.length;
    
    var word_array = new Array();
    for( i=0; i<msg_len-3; i+=4 ) {
        j = msg.charCodeAt(i)<<24 | msg.charCodeAt(i+1)<<16 |
            msg.charCodeAt(i+2)<<8 | msg.charCodeAt(i+3);
        word_array.push( j );
    }
    
    switch( msg_len % 4 ) {
    case 0:
        i = 0x080000000;
        break;
    case 1:
        i = msg.charCodeAt(msg_len-1)<<24 | 0x0800000;
        break;
        
    case 2:
        i = msg.charCodeAt(msg_len-2)<<24 | msg.charCodeAt(msg_len-1)<<16 | 0x08000;
        break;
        
    case 3:
        i = msg.charCodeAt(msg_len-3)<<24 | msg.charCodeAt(msg_len-2)<<16 | msg.charCodeAt(msg_len-1)<<8        | 0x80;
        break;
    }
    
    word_array.push( i );
    
    while( (word_array.length % 16) != 14 ) word_array.push( 0 );
    
    word_array.push( msg_len>>>29 );
    word_array.push( (msg_len<<3)&0x0ffffffff );
    
    
    for ( blockstart=0; blockstart<word_array.length; blockstart+=16 ) {
        
        for( i=0; i<16; i++ ) W[i] = word_array[blockstart+i];
        for( i=16; i<=79; i++ ) W[i] = rotate_left(W[i-3] ^ W[i-8] ^ W[i-14] ^ W[i-16], 1);
        
        A = H0;
        B = H1;
        C = H2;
        D = H3;
        E = H4;
        
        for( i= 0; i<=19; i++ ) {
            temp = (rotate_left(A,5) + ((B&C) | (~B&D)) + E + W[i] + 0x5A827999) & 0x0ffffffff;
            E = D;
            D = C;
            C = rotate_left(B,30);
            B = A;
            A = temp;
        }
        
        for( i=20; i<=39; i++ ) {
            temp = (rotate_left(A,5) + (B ^ C ^ D) + E + W[i] + 0x6ED9EBA1) & 0x0ffffffff;
            E = D;
            D = C;
            C = rotate_left(B,30);
            B = A;
            A = temp;
        }
        
        for( i=40; i<=59; i++ ) {
            temp = (rotate_left(A,5) + ((B&C) | (B&D) | (C&D)) + E + W[i] + 0x8F1BBCDC) & 0x0ffffffff;
            E = D;
            D = C;
            C = rotate_left(B,30);
            B = A;
            A = temp;
        }
        
        for( i=60; i<=79; i++ ) {
            temp = (rotate_left(A,5) + (B ^ C ^ D) + E + W[i] + 0xCA62C1D6) & 0x0ffffffff;
            E = D;
            D = C;
            C = rotate_left(B,30);
            B = A;
            A = temp;
        }
        
        H0 = (H0 + A) & 0x0ffffffff;
        H1 = (H1 + B) & 0x0ffffffff;
        H2 = (H2 + C) & 0x0ffffffff;
        H3 = (H3 + D) & 0x0ffffffff;
        H4 = (H4 + E) & 0x0ffffffff;
        
    }
    
    temp = cvt_hex(H0) + cvt_hex(H1) + cvt_hex(H2) + cvt_hex(H3) + cvt_hex(H4);
    
    return temp.toLowerCase();
    
}

function ensureCachedThumbnail(cacheDirectory, media) {
    let thumbnail_url = media.get_thumbnail();
    let thumbnail_filename = SHA1(thumbnail_url);
    let file = cacheDirectory + '/' + thumbnail_filename;
    let uri = GLib.filename_to_uri(file, null);

    if (GLib.file_test(file, GLib.FileTest.EXISTS))
        return uri;

    let f = Gio.file_new_for_path(file);
    let raw = f.replace(null, false,
                        Gio.FileCreateFlags.NONE,
                        null);

    let out = Gio.BufferedOutputStream.new_sized(raw, 4096);

    let success = false;
    try {
        let session = new Soup.SessionSync();
        let msg = Soup.Message.new("GET", media.get_thumbnail());
        let status = session.send_message(msg);
        Shell.write_soup_message_to_stream(out, msg);
    } catch (e) {
        logError(e, 'Error caching avatar data');
    }
    out.close(null);
    return uri;
}

function GriloSearchProvider(registry, source) {
    this._init(registry, source);
}

GriloSearchProvider.prototype = {
    __proto__: Search.SearchProvider.prototype,

    _init: function(registry, source) {
        Search.SearchProvider.prototype._init.call(this, source.get_name());
        this._registry = registry;
        this._source = source;
        this._searchId = -1;
        this._medias = {};
        this._cacheDir = GLib.get_user_cache_dir() + '/gnome-shell/grilo';
        GLib.mkdir_with_parents(this._cacheDir, 0x1c0); // 0x1c0 = octal 0700
    },

    _searchCallback: function(source, browseId, media, remaining, userData, error) {
        if (error) {
            global.log("Search failed " + error.message);
            //this._medias = {};
            return;
        }

        if (this._searchId < 0) {
            global.log("Search was cancelled");
            return;
        }

        if (media) {
            this._medias[media.get_id()] = media;
        }

        if (!remaining) {
            this._searchId = -1;
            global.log("Search finished");
            let keys = [];
            for (var key in this._medias) {
                keys.push(key);
            }
            this.addItems(keys);
            //this._medias = {};
        }
    },

    _search: function(terms) {
        let source = this._source;
        // TODO: limit search to id, title, url, thumbnail keys?
        let keys = this._registry.get_metadata_keys();
        this.startAsync();
        this._searchId = source.search(terms[0], keys, 0, 10,
                                       Grl.MetadataResolutionFlags.IDLE_RELAY | Grl.MetadataResolutionFlags.RESOLVE_FAST_ONLY,
                                       Lang.bind(this, this._searchCallback), null);
    },

    _asyncCancelled: function() {
        let source = this._source;
        if (this._searchId > -1)
            Grl.operation_cancel(this._searchId);
        this._searchId = -1;
    },

    getResultMeta: function(resultId) {
        let media = this._medias[resultId];
        let cacheDir = this._cacheDir;
        return { 'id': resultId,
                 'name': media.get_title(),
                 'createIcon': function(size) {
                     let textureCache = St.TextureCache.get_default();
                     let uri = ensureCachedThumbnail(cacheDir, media);
                     return textureCache.load_uri_async(uri, size, size);
                 }
               };
    },

    activateResult: function(id, params) {
        params = Params.parse(params, { workspace: null,
                                        timestamp: null });
        let media = this._medias[id];
        let url = media.get_url();
        try {
            Gio.app_info_launch_default_for_uri(url, global.create_app_launch_context());
        } catch (e) {
            // TODO: remove this after glib will be removed from moduleset
            // In the default jhbuild, gio is in our prefix but gvfs is not
            Util.spawn(['gvfs-open', url]);
        }

        Main.overview.hide();
    },

    getInitialResultSet: function(terms) {
        this._medias = {};
        global.log("Search terms " + terms[0]);
        this._search(terms);
        return [];
    },

    getSubsearchResultSet: function(previousResults, terms) {
        global.log("sub Search terms " + terms);
        this.tryCancelAsync();
        return this.getInitialResultSet(terms);
    }
};

function main() {
    Grl.init(null, null);
    let registry = Grl.PluginRegistry.get_default();

    let youtubeConfig = Grl.Config.new("grl-youtube", null);
    youtubeConfig.set_api_key("AI39si4EfscPllSfUy1IwexMf__kntTL_G5dfSr2iUEVN45RHGq92Aq0lX25OlnOkG6KTN-4soVAkAf67fWYXuHfVADZYr7S1A");
    registry.add_config(youtubeConfig, null);

    let vimeoConfig = Grl.Config.new("grl-vimeo", null);
    vimeoConfig.set_api_key("4d908c69e05a9d5b5c6669d302f920cb");
    vimeoConfig.set_api_secret("4a923ffaab6238eb");
    registry.add_config(vimeoConfig, null);

    let flickrConfig = Grl.Config.new("grl-flickr", null);
    flickrConfig.set_api_key("fa037bee8120a921b34f8209d715a2fa");
    flickrConfig.set_api_secret("9f6523b9c52e3317");
    registry.add_config(flickrConfig, null);

    registry.load_all();

    let sources = registry.get_sources_by_operations(Grl.SupportedOps.SEARCH, false);
    for(let i=0; i < sources.length; i++) {
        let source = sources[i];
        let sourceId = source.get_id();
        global.log(source.get_id());
        if (sourceId == "grl-filesystem")
            continue;
        Main.overview.viewSelector.addSearchProvider(new GriloSearchProvider(registry, source));
    }
}
