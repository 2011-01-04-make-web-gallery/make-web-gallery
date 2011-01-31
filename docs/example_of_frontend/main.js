(function() {
    'use strict'
    
    var html_ns = 'http://www.w3.org/1999/xhtml'
    
    function debug_log(value) {
        var pre = document.getElementById('debug_log')
        
        if(pre) {
            pre.appendChild(
                document.createTextNode('⚠ Debug Log: ' + value)
            )
            pre.appendChild(
                document.createElementNS(html_ns, 'html:br')
            )
        }
    }
    
    var func_tools = {
        args_array: function(raw_args) {
            var args = []
        
            for(var i = 0; i < raw_args.length; ++i) {
                args.push(raw_args[i])
            }
            
            return args
        },
        func_bind: function(func, this_arg) {
            var args_array = this.args_array
            var args = args_array(arguments).slice(2)
            
            if(func.bind) {
                // using built 'func.bind()'. this is more effective way
                
                var bound = func.bind.apply(func, [this_arg].concat(args))
                
                return bound
            } else {
               // using emulation  of 'func.bind()'. this is less effective way
                
                var bound = function() {
                    var func_args = args.concat(args_array(arguments))
                    var func_res = func.apply(this_arg, func_args)
                    
                    return func_res
                }
                
                return bound
            }
        },
    }
    
    function head_params_iterate(params_name, params_ns, iter) {
        for(var in_root_node = document.firstChild;
                in_root_node;
                in_root_node = in_root_node.nextSibling) {
            if(in_root_node.localName == 'html' &&
                    in_root_node.namespaceURI == html_ns) {
                for(var in_html_node = in_root_node.firstChild;
                        in_html_node;
                        in_html_node = in_html_node.nextSibling) {
                    if(in_html_node.localName == 'head' &&
                            in_html_node.namespaceURI == html_ns) {
                        for(var in_head_node = in_html_node.firstChild;
                                in_head_node;
                                in_head_node = in_head_node.nextSibling) {
                            if(in_head_node.localName == params_name &&
                                    in_head_node.namespaceURI == params_ns) {
                                iter(in_head_node)
                            }
                        }
                    }
                }
            }
        }
    }
    
    function Gallery() {}
    
    function new_gallery() {
        var gallery = new Gallery
        gallery.init()
        
        return gallery
    }
    
    Gallery.prototype.init = function() {
        this._page_len = 20
        this._items = []
        this._last_preview_window = null
    }
    
    Gallery.prototype.items_load_init = function(kwargs) {
        var item = {}
        
        item.id = this._items.length + 1
        item.img = kwargs.dir + '/' + kwargs.img_basename
        
        if(kwargs.label) {
            item.label = kwargs.label
        } else {
            item.label = item.img
        }
        
        this._items.unshift(item)
    }
    
    Gallery.prototype._get_real_item_id = function(i) {
        var item = this._items[i]
        
        if(item) {
            return item.id
        }
    }
    
    Gallery.prototype._create_gallery_page = function(begin, end) {
        var text = document.createElementNS(html_ns, 'html:h2')
        text.appendChild(
            document.createTextNode(
                'Текущая выбранная страница: [ ' + this._get_real_item_id(begin) + ' : ... ]'
            )
        )
        
        var icons = document.createElementNS(html_ns, 'html:div')
        function create_icon(item) {
            function on_click(event) {
                var preview_window = window.open(item.img, '_blank')
                
                if(this._last_preview_window) {
                    try {
                        this._last_preview_window.close()
                    } catch(e) {}
                }
                
                this._last_preview_window = preview_window
            }
            
            var img = document.createElementNS(html_ns, 'html:img')
            var img_name = '[' + item.id + ']: ' + item.label
            
            img.alt = img_name
            img.src = item.img
            img.title = img_name
            img.className = 'GalleryIcon'
            img.addEventListener('click', func_tools.func_bind(on_click, this), false)
            
            return img
        }
        
        for(var i = begin; i < end; ++i) {
            var item = this._items[i]
            
            if(item) {
                var icon = create_icon.call(this, item)
                
                icons.appendChild(icon)
                icons.appendChild(document.createTextNode(' '))
            }
        }
        
        var panel = document.createElementNS(html_ns, 'html:div')
        
        panel.appendChild(text)
        panel.appendChild(icons)
        
        return panel
    }
    
    Gallery.prototype._switch_gallery_page = function(begin, end) {
        var gallery_page = this._create_gallery_page(begin, end)
        
        this._sel_page_elem.parentNode.replaceChild(gallery_page, this._sel_page_elem)
        
        this._sel_page_begin = begin
        this._sel_page_elem = gallery_page
    }
    
    Gallery.prototype._create_page_menu = function() {
        var text_panel = document.createElementNS(html_ns, 'html:div')
        text_panel.appendChild(
            document.createTextNode('Страницы:')
        )
        
        var buttons_panel = document.createElementNS(html_ns, 'html:div')
        buttons_panel.style.display = 'none'
        
        function create_button(begin, end) {
            var button = document.createElementNS(html_ns, 'html:input')
            button.type = 'button'
            button.value = '[ ' + this._get_real_item_id(begin) + ' : ... ]'
            button.addEventListener(
                    'click',
                    func_tools.func_bind(function(event) {
                        this._switch_gallery_page(begin, end)
                    }, this),
                    false)
            
            return button
        }
        
        for(var begin = 0; begin < this._items.length; begin += this._page_len) {
            var end = begin + this._page_len
            var button = create_button.call(this, begin, end)
            
            buttons_panel.appendChild(button)
            buttons_panel.appendChild(document.createTextNode(' '))
        }
        
        var shortcut_buttons_panel = document.createElementNS(html_ns, 'html:div')
        
        var left_button = document.createElementNS(html_ns, 'html:input')
        
        function on_left_click(event) {
            var begin = this._sel_page_begin - this._page_len
            
            if(begin < 0) {
                begin = 0
            }
            
            var end = begin + this._page_len
            
            this._switch_gallery_page(begin, end)
        }
        
        left_button.type = 'button'
        left_button.value = '<< Влево'
        left_button.addEventListener('click', func_tools.func_bind(on_left_click, this), false)
        
        var right_button = document.createElementNS(html_ns, 'html:input')
        
        function on_right_click(event) {
            var begin = this._sel_page_begin + this._page_len
            var end = begin + this._page_len
            
            if(this._items[begin]) {
                this._switch_gallery_page(begin, end)
            }
        }
        
        right_button.type = 'button'
        right_button.value = 'Вправо >>'
        right_button.addEventListener('click', func_tools.func_bind(on_right_click, this), false)
        
        var show_all_button = document.createElementNS(html_ns, 'html:input')
        
        function on_show_all_click(event) {
            if(buttons_panel.style.display == 'none') {
                buttons_panel.style.display = 'block'
            } else {
                buttons_panel.style.display = 'none'
            }
        }
        
        show_all_button.type = 'button'
        show_all_button.value = 'Показать/Скрыть все страницы'
        show_all_button.addEventListener('click', func_tools.func_bind(on_show_all_click, this), false)
        
        shortcut_buttons_panel.appendChild(left_button)
        shortcut_buttons_panel.appendChild(document.createTextNode(' '))
        shortcut_buttons_panel.appendChild(right_button)
        shortcut_buttons_panel.appendChild(document.createTextNode(' '))
        shortcut_buttons_panel.appendChild(show_all_button)
        
        var panel = document.createElementNS(html_ns, 'html:div')
        panel.style.margin = '5px'
        panel.style.border = '1px inset'
        panel.style.padding = '5px'
        
        panel.appendChild(text_panel)
        panel.appendChild(shortcut_buttons_panel)
        panel.appendChild(buttons_panel)
        
        return panel
    }
    
    Gallery.prototype.create = function() {
        this._sel_page_begin = 0
        this._sel_page_elem = this._create_gallery_page(this._sel_page_begin, this._sel_page_begin + this._page_len)
        var top_menu = this._create_page_menu()
        var bottom_menu = this._create_page_menu()
        
        var panel = document.createElementNS(html_ns, 'html:div')
        panel.appendChild(top_menu)
        panel.appendChild(this._sel_page_elem)
        panel.appendChild(bottom_menu)
        
        this.node = panel
    }
    
    function GalleryLoader() {}
    
    function new_gallery_loader(params) {
        var gallery_loader = new GalleryLoader
        gallery_loader.init(params)
        
        return gallery_loader
    }
    
    GalleryLoader.prototype.init = function(params) {
        this._params = params
    }
    
    GalleryLoader.prototype._create_ajax_loading = function() {
        var img = document.createElementNS(html_ns, 'html:img')
        img.src = 'ajax-loader.gif'
        img.alt = 'Loading...'
        
        var panel = document.createElementNS(html_ns, 'html:div')
        panel.style.padding = '30px'
        panel.style.textAlign = 'center'
        
        panel.appendChild(img)
        
        return panel
    }
    
    GalleryLoader.prototype._run_complete = function() {
        var gallery = new_gallery()
        
        for(var i = 0; i < this._params.load_items_json.length; ++i) {
            var load_items_json_param = this._params.load_items_json[i]
            var items_json = this._loaded_items_json[load_items_json_param]
            
            if(items_json.type == '/2011/01/04/MakeWebGallery/2011/01/20/items_json/rich_list') {
                for(var ii = 0; ii < items_json.content.length; ++ii) {
                    gallery.items_load_init({
                        dir: load_items_json_param,
                        img_basename: items_json.content[ii].img_basename,
                        label: items_json.content[ii].img_basename.label,
                    })
                }
            }
        }
        
        if(this._target && this._target.parentNode) {
            gallery.create()
            this._target.parentNode.replaceChild(gallery.node, this._target)
            this._target = gallery
        }
    }
    
    GalleryLoader.prototype._items_json_request = function(load_items_json_param) {
        var url = load_items_json_param + '/items.json'
        var req = new XMLHttpRequest()
        
        function transfer_complete(event) {
            if(!req.status || req.status == 200) {
                var items_json = JSON.parse(req.responseText)
                
                this._loaded_items_json[load_items_json_param] = items_json
                ++this._loaded_items_json_size
                
                if(this._loaded_items_json_size == this._params.load_items_json.length) {
                    this._run_complete()
                }
            } else {
                debug_log('Transfer Failed Status: ' + url + ': ' + req.status)
            }
        }
        req.addEventListener(
                'load', func_tools.func_bind(transfer_complete, this), false)
        req.addEventListener(
                'error', function(event) { debug_log('Transfer Failed: ' + url) }, false)
        req.addEventListener(
                'abort', function(event) { debug_log('Transfer Canceled: ' + url) }, false)
        req.open('GET', url)
        req.send()
    }
    
    GalleryLoader.prototype.run = function() {
        this._target = document.getElementById(this._params.target_id)
        
        if(this._target && this._target.parentNode) {
            var ajax_loading = this._create_ajax_loading()
            
            this._target.parentNode.replaceChild(ajax_loading, this._target)
            this._target = ajax_loading
            
            this._loaded_items_json = {}
            this._loaded_items_json_size = 0
            
            for(var i = 0; i < this._params.load_items_json.length; ++i) {
                var load_items_json_param = this._params.load_items_json[i]
                
                this._items_json_request(load_items_json_param)
            }
        }
    }
    
    function get_gallery_params_list() {
        var web_gallery_params_ns = '/2011/01/20/web_gallery/2011/01/20/params'
        
        var gallery_params_list = []
        
        head_params_iterate(
            'gallery',
            web_gallery_params_ns,
            function(params_node) {
                var gallery_params = {
                    target_id: params_node.getAttributeNS('', 'target_id'),
                    load_items_json: [],
                }
                
                for(var param_node = params_node.firstChild;
                        param_node;
                        param_node = param_node.nextSibling) {
                    if(param_node.localName == 'load_items_json' &&
                            param_node.namespaceURI == web_gallery_params_ns) {
                        var path = param_node.getAttributeNS('', 'path')
                        
                        gallery_params.load_items_json.push(path)
                    }
                }
                
                gallery_params_list.push(gallery_params)
            }
        )
        
        return gallery_params_list
    }
    
    function main() {
        var gallery_params_list = get_gallery_params_list()
        
        for(var i = 0; i < gallery_params_list.length; ++i) {
            var gallery_loader = new_gallery_loader(gallery_params_list[i])
            
            gallery_loader.run()
        }
    }
    
    addEventListener('load', function(event) { main() }, false)
})()

