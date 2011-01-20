(function() {
    var TRY_LEGACY = true
    
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
    
    function Gallery() {
        this._page_len = 20
        this._items = []
        this._sel_dir
        this._last_preview_window = null
        
        this.items_prepare_load_init = function(kwargs) {
            if(kwargs.dir) {
                this._sel_dir = kwargs.dir
            }
        }
        
        this.items_load_init = function(kwargs) {
            var item = {}
            
            item.id = this._items.length + 1
            item.img = this._sel_dir + '/' + kwargs.img_basename
            
            if(kwargs.label) {
                item.label = kwargs.label
            } else {
                item.label = item.img
            }
            
            this._items.unshift(item)
        }
        
        this._get_real_item_id = function(i) {
            var item = this._items[i]
            
            if(item) {
                return item.id
            }
        }
        
        this._create_gallery_page = function(begin, end) {
            var self = this
            
            var text = document.createElementNS(html_ns, 'html:h2')
            text.appendChild(
                document.createTextNode(
                    'Текущая выбранная страница: [ ' + this._get_real_item_id(begin) + ' : ... ]'
                )
            )
            
            var icons = document.createElementNS(html_ns, 'html:div')
            function create_icon(item) {
                function on_click() {
                    preview_window = window.open(item.img, '_blank')
                    
                    if(self._last_preview_window) {
                        try {
                            self._last_preview_window.close()
                        } catch(e) {}
                    }
                    
                    self._last_preview_window = preview_window
                }
                
                var img = document.createElementNS(html_ns, 'html:img')
                var img_name = '[' + item.id + ']: ' + item.label
                
                img.alt = img_name
                img.src = item.img
                img.title = img_name
                img.className = 'GalleryIcon'
                img.addEventListener('click', function(event) { on_click() }, false)
                
                return img
            }
            
            for(var i = begin; i < end; ++i) {
                var item = this._items[i]
                
                if(item) {
                    var icon = create_icon(item)
                    
                    icons.appendChild(icon)
                    icons.appendChild(document.createTextNode(' '))
                }
            }
            
            var panel = document.createElementNS(html_ns, 'html:div')
            
            panel.appendChild(text)
            panel.appendChild(icons)
            
            return panel
        }
        
        this._switch_gallery_page = function(begin, end) {
            var gallery_page = this._create_gallery_page(begin, end)
            
            this._sel_page_elem.parentNode.replaceChild(gallery_page, this._sel_page_elem)
            
            this._sel_page_begin = begin
            this._sel_page_elem = gallery_page
        }
        
        this._create_page_menu = function() {
            var self = this
            
            var text_panel = document.createElementNS(html_ns, 'html:div')
            text_panel.appendChild(
                document.createTextNode('Страницы:')
            )
            
            var buttons_panel = document.createElementNS(html_ns, 'html:div')
            buttons_panel.style.display = 'none'
            
            function create_button(begin, end) {
                var button = document.createElementNS(html_ns, 'html:input')
                button.type = 'button'
                button.value = '[ ' + self._get_real_item_id(begin) + ' : ... ]'
                button.addEventListener('click', function(event) { self._switch_gallery_page(begin, end) }, false)
                
                return button
            }
            
            for(var begin = 0; begin < this._items.length; begin += this._page_len) {
                var end = begin + this._page_len
                var button = create_button(begin, end)
                
                buttons_panel.appendChild(button)
                buttons_panel.appendChild(document.createTextNode(' '))
            }
            
            var shortcut_buttons_panel = document.createElementNS(html_ns, 'html:div')
            
            var left_button = document.createElementNS(html_ns, 'html:input')
            
            function on_left_click() {
                var begin = self._sel_page_begin - self._page_len
                
                if(begin < 0) {
                    begin = 0
                }
                
                var end = begin + self._page_len
                
                self._switch_gallery_page(begin, end)
            }
            
            left_button.type = 'button'
            left_button.value = '<< Влево'
            left_button.addEventListener('click', function(event) { on_left_click() }, false)
            
            var right_button = document.createElementNS(html_ns, 'html:input')
            
            function on_right_click() {
                var begin = self._sel_page_begin + self._page_len
                var end = begin + self._page_len
                
                if(self._items[begin]) {
                    self._switch_gallery_page(begin, end)
                }
            }
            
            right_button.type = 'button'
            right_button.value = 'Вправо >>'
            right_button.addEventListener('click', function(event) { on_right_click() }, false)
            
            var show_all_button = document.createElementNS(html_ns, 'html:input')
            
            function on_show_all_click() {
                if(buttons_panel.style.display == 'none') {
                    buttons_panel.style.display = 'block'
                } else {
                    buttons_panel.style.display = 'none'
                }
            }
            
            show_all_button.type = 'button'
            show_all_button.value = 'Показать/Скрыть все страницы'
            show_all_button.addEventListener('click', function(event) { on_show_all_click() }, false)
            
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
        
        this.create = function() {
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
    }
    
    var gallery = new Gallery()
    window['/2011/01/04/MakeWebGallery/2011/01/20/items_js/prepare_load'] = 
        function(kwargs) { gallery.items_prepare_load_init(kwargs) }
    window['/2011/01/04/MakeWebGallery/2011/01/20/items_js/load'] = 
        function(kwargs) { gallery.items_load_init(kwargs) }
    if(TRY_LEGACY) {
        // for backward compatible only
        
        window['2011-01-04.MakeWebGallery:prepare_load'] = 
            function(kwargs) { gallery.items_prepare_load_init(kwargs) }
        window['2011-01-04.MakeWebGallery:load'] = 
            function(kwargs) { gallery.items_load_init(kwargs) }
    }
    
    function main() {
        var gallery_target_elem = document.getElementById('/2011/01/20/web_gallery/2011/01/20/no_script')
        
        if(gallery_target_elem) {
            gallery.create()
            
            gallery_target_elem.parentNode.replaceChild(gallery.node, gallery_target_elem)
        }
    }
    
    addEventListener('load', function(event) { main() }, false)
})()

