/* -*- mode: js2; js2-basic-offset: 4; indent-tabs-mode: nil -*- */
const Gettext = imports.gettext.domain('gnome-shell-extensions');
const _ = Gettext.gettext;

const Gio = imports.gi.Gio;
const GLib = imports.gi.GLib;
const Grl = imports.gi.Grl;
const Shell = imports.gi.Shell;
const Soup = imports.gi.Soup;
const St = imports.gi.St;

const IconGrid = imports.ui.iconGrid;
const Panel = imports.ui.panel;
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



function GriloItemInfo(timestamp, name, uri, mime_type) {
    this._init(timestamp, name, uri, mime_type);
}

// This class emulates a RecentItemInfo
GriloItemInfo.prototype = {
    _init: function(timestamp, name, uri, mime_type) {
        this._timestamp = timestamp;
        this._name = name;
        this._uri = uri;
        this._mime_type = mime_type;
    },

    get_modified: function() {
        return this._timestamp;
    },

    get_display_name: function() {
        return this._name;
    },

    get_uri: function() {
        return this._uri;
    },

    get_mime_type: function() {
        return this._mime_type;
    }
}

function GriloSearchProvider(extension, source) {
    this._init(extension, source);
}

GriloSearchProvider.prototype = {
    __proto__: Search.SearchProvider.prototype,

    _init: function(extension, source) {
        Search.SearchProvider.prototype._init.call(this, source.get_name());
        this._extension = extension;
        this._source = source;
        this._searchId = -1;
        this._medias = {};
        this._soupSession = new Soup.SessionSync();
        this._cacheDir = GLib.get_user_cache_dir() + '/gnome-shell/grilo';
        GLib.mkdir_with_parents(this._cacheDir, 0x1c0); // 0x1c0 = octal 0700
    },

    _searchCallback: function(source, browseId, media, remaining, userData, error) {
        if (error) {
            global.log("Search failed " + error.message);
            //this._medias = {};
            this.performSearchOnNextProvider();
            return;
        }

        if (this._searchId < 0)
            return;

        if (media) {
            this._medias[media.get_id()] = media;
        }

        if (!remaining) {
            this._searchId = -1;
            let keys = [];
            for (var key in this._medias) {
                keys.push(key);
            }
            this.addItems(keys);
            //this._medias = {};
            this.performSearchOnNextProvider();
        }
    },

    performSearchOnNextProvider: function() {
        this._extension.nextProvider(this, this._terms);
    },

    _search: function(terms) {
        let searchQuery = terms.join(' ');
        this._terms = terms;

        // Avoid expensive search for too small criteria string.
        if (searchQuery.length < 3)
            return;

        if (!this._extension.canSearch(this))
            return;

        global.log("Search query in " + this._source.get_id() + ": " + searchQuery);

        let source = this._source;
        let keys = [Grl.METADATA_KEY_ID, Grl.METADATA_KEY_TITLE, Grl.METADATA_KEY_URL,
                    Grl.METADATA_KEY_MIME, Grl.METADATA_KEY_SITE,
                    Grl.METADATA_KEY_EXTERNAL_URL, Grl.METADATA_KEY_THUMBNAIL];
        this.startAsync();
        this._searchId = source.search(searchQuery, keys, 0, 12,
                                       Grl.MetadataResolutionFlags.IDLE_RELAY | Grl.MetadataResolutionFlags.RESOLVE_FAST_ONLY,
                                       Lang.bind(this, this._searchCallback), null);
    },

    _asyncCancelled: function() {
        this._soupSession.abort();
        if (this._searchId > -1)
            Grl.operation_cancel(this._searchId);
        this._searchId = -1;
    },

    getResultMeta: function(resultId) {
        let media = this._medias[resultId];
        if (!media)
            return null;

        let name = media.get_title();
        if (!name)
            name = "";
        return { 'id': resultId,
                 'name': name,
                 'media': media
               };
    },

    _cachedThumbnailPath: function(media) {
        let thumbnailUrl = media.get_thumbnail();
        let thumbnailFilename = SHA1(thumbnailUrl);
        let file = this._cacheDir + '/' + thumbnailFilename;
        return file;
    },

    _writeThumbnailToDisk: function(session, msg, userData) {
        let file = userData['file'];
        let iconActor = userData['iconActor'];
        let uri = GLib.filename_to_uri(file, null);
        let f = Gio.file_new_for_path(file);
        let raw = f.replace(null, false, Gio.FileCreateFlags.NONE, null);
        let out = Gio.BufferedOutputStream.new_sized(raw, 4096);

        Shell.write_soup_message_to_stream(out, msg);
        out.close(null);

        // Load written picture file to the icon's actor.

        let textureCache = St.TextureCache.get_default();
        let size = iconActor.iconSize;

        iconActor.createIcon = function(size) {
            return textureCache.load_uri_async(uri, size, size);
        };

        // This should trigger a call to createIcon().
        iconActor.actor.emit('style-changed');
    },

    createResultActor: function(resultMeta, terms) {
        let content = new St.Bin({ style_class: 'search-result-content',
                               reactive: true,
                               track_hover: true });
        let icon;
        let media = resultMeta['media'];
        let cachedThumbnailPath = this._cachedThumbnailPath(media);
        let textureCache = St.TextureCache.get_default();

        if (GLib.file_test(cachedThumbnailPath, GLib.FileTest.EXISTS)) {
            let uri = GLib.filename_to_uri(cachedThumbnailPath, null);
            icon = new IconGrid.BaseIcon(resultMeta['name'],
                                         { createIcon: function(size) {
                                           return textureCache.load_uri_async(uri, size, size);
                                           }
                                         });
        } else {
            // Asynchronously load the thumbnail into a place-holder.
            icon = new IconGrid.BaseIcon(resultMeta['name']);
            icon.spinner = new Panel.AnimatedIcon('process-working.svg', Panel.PANEL_ICON_SIZE);

            icon.createIcon = function(size) {
                // FIXME: This requires a patched shell icongrid.js
                // https://bugzilla.gnome.org/show_bug.cgi?id=655831
                icon.spinner.actor.show();
                return icon.spinner.actor;
            };

            let msg = Soup.Message.new("GET", media.get_thumbnail());
            let userData = {
                'file': cachedThumbnailPath,
                'iconActor': icon
            };
            this._soupSession.queue_message(msg, Lang.bind(this, this._writeThumbnailToDisk, userData));
        }

        content.set_child(icon.actor);
        return content;
    },

    _makeLaunchContext: function(params) {
        params = Params.parse(params, { workspace: null,
                                        timestamp: null });

        let launchContext = global.create_app_launch_context();
        if (params.workspace != null)
            launchContext.set_desktop(params.workspace.index());
        if (params.timestamp != null)
            launchContext.set_timestamp(params.timestamp);

        return launchContext;
    },

    _createItemForMedia: function(media, url) {
        let mimeType = media.get_mime();
        if (!mimeType)
            mimeType = "image/jpeg";
        global.log("media mime: " + mimeType);
        let item = new GriloItemInfo(new Date().getTime(),
                                     media.get_title(), url, mimeType);
        return item;
    },

    _gotMetadata: function(source, operationId, media, params) {
        let url = media.get_url();
        if (url) {
            let item = this._createItemForMedia(media, url);
            Gio.app_info_launch_default_for_uri(item.get_uri(), this._makeLaunchContext(params));
        }
    },

    _processMetadata: function(media, params) {
        let keys = [Grl.METADATA_KEY_URL];
        let flags = Grl.MetadataResolutionFlags.IDLE_RELAY | Grl.MetadataResolutionFlags.FULL;
        this._source.metadata(media, keys, flags, Lang.bind(this, this._gotMetadata, params));
    },

    activateResult: function(id, params) {
        let media = this._medias[id];
        let url;
        if (this._source.get_id() == "grl-youtube")
            url = media.get_site();
        else
            url = media.get_url();
        global.log("media url " + url);
        if (!url)
            url = media.get_external_url();
        global.log("media external url " + url);
        if (url) {
            let item = this._createItemForMedia(media, url);
            Gio.app_info_launch_default_for_uri(item.get_uri(), this._makeLaunchContext(params));
        }
        else
            this._processMetadata(media, params);
    },

    getInitialResultSet: function(terms) {
        this._medias = {};
        this._search(terms);
        return [];
    },

    getSubsearchResultSet: function(previousResults, terms) {
        this.tryCancelAsync();
        return this.getInitialResultSet(terms);
    }
};

function GriloSearchExtension() {
    this._init();
}

GriloSearchExtension.prototype = {
    _init: function() {
        Grl.init(null, null);
        this._registry = Grl.PluginRegistry.get_default();
        this._registered_providers = [];
        this._current_provider = 0;

        let youtubeConfig = Grl.Config.new("grl-youtube", null);
        youtubeConfig.set_api_key("AI39si4EfscPllSfUy1IwexMf__kntTL_G5dfSr2iUEVN45RHGq92Aq0lX25OlnOkG6KTN-4soVAkAf67fWYXuHfVADZYr7S1A");
        this._registry.add_config(youtubeConfig, null);

        let vimeoConfig = Grl.Config.new("grl-vimeo", null);
        vimeoConfig.set_api_key("4d908c69e05a9d5b5c6669d302f920cb");
        vimeoConfig.set_api_secret("4a923ffaab6238eb");
        this._registry.add_config(vimeoConfig, null);

        let flickrConfig = Grl.Config.new("grl-flickr", null);
        flickrConfig.set_api_key("fa037bee8120a921b34f8209d715a2fa");
        flickrConfig.set_api_secret("9f6523b9c52e3317");
        this._registry.add_config(flickrConfig, null);

        this._registry.load_all();
    },

    enable: function() {
        global.log("enable!");
        let sources = this._registry.get_sources_by_operations(Grl.SupportedOps.SEARCH, false);
        for(let i=0; i < sources.length; i++) {
            let source = sources[i];
            let sourceId = source.get_id();
            if (sourceId == "grl-filesystem")
                continue;
            let provider = new GriloSearchProvider(this, source);
            Main.overview.viewSelector.addSearchProvider(provider);
            this._registered_providers.push(provider);
        }
    },

    disable: function() {
        global.log("disable!");
        for(let i=0; i < this._registered_providers.length; i++) {
            let provider = this._registered_providers[i];
            Main.overview.viewSelector.removeSearchProvider(provider);
        }
        this._registered_providers = [];
    },

    nextProvider: function(provider, terms) {
        if (this._registered_providers[this._current_provider] == provider) {
            // Perform search on next provider.
            this._current_provider++;
            if (this._current_provider < this._registered_providers.length)
                this._registered_providers[this._current_provider].getInitialResultSet(terms);
        }
        if (this._current_provider == this._registered_providers.length)
            this._current_provider = 0;
    },

    canSearch: function(provider) {
       return this._registered_providers[this._current_provider] == provider;
    }

};

function init() {
    return new GriloSearchExtension();
}
