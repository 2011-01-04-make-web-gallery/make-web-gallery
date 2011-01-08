(function() {
    var html_ns = 'http://www.w3.org/1999/xhtml'
    
    function debug_log(value) {
        document.body.appendChild(
            document.createTextNode('⚠ Debug Log: ' + value)
        )
        document.body.appendChild(
            document.createElementNS(html_ns, 'html:br')
        )
    }
    
    var page_len = 20
    var items = []
    var sel_dir
    var sel_page_begin
    var sel_page_elem
    var last_preview_window = null
    
    function on_items_prepare_load(kwargs) {
        if(kwargs.dir) {
            sel_dir = kwargs.dir
        }
    }
    
    function on_items_load(kwargs) {
        var item = {}
        
        if(kwargs.img_basename) {
            item.img = sel_dir + '/' + kwargs.img_basename
        }
        
        if(kwargs.label) {
            item.label = kwargs.label
        } else {
            item.label = item.img
        }
        
        items.unshift(item)
    }
    
    function create_gallery_page(begin, end) {
        var text = document.createElementNS(html_ns, 'html:h2')
        text.appendChild(
            document.createTextNode('Текущая выбранная страница: [' + begin + ':' + end + ']')
        )
        
        var icons = document.createElementNS(html_ns, 'html:div')
        
        function create_icon(item) {
            function on_click() {
                preview_window = window.open(item.img, '_blank')
                
                if(last_preview_window) {
                    try {
                        last_preview_window.close()
                    } catch(e) {}
                }
                
                last_preview_window = preview_window
            }
            
            var img = document.createElementNS(html_ns, 'html:img')
            
            img.alt = item.label
            img.src = item.img
            img.title = item.label
            img.className = 'GalleryIcon'
            img.addEventListener('click', function(event) { on_click() }, false)
            
            return img
        }
        
        for(var i = begin; i < end; ++i) {
            var item = items[i]
            
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
    
    function switch_gallery_page(begin, end) {
        var gallery_page = create_gallery_page(begin, end)
        
        sel_page_elem.parentNode.replaceChild(gallery_page, sel_page_elem)
        
        sel_page_begin = begin
        sel_page_elem = gallery_page
    }
    
    function create_page_menu() {
        var text_panel = document.createElementNS(html_ns, 'html:div')
        text_panel.appendChild(
            document.createTextNode('Страницы:')
        )
        
        var buttons_panel = document.createElementNS(html_ns, 'html:div')
        buttons_panel.style.display = 'none'
        
        function create_button(begin, end) {
            var button = document.createElementNS(html_ns, 'html:input')
            button.type = 'button'
            button.value = begin + ':' + end
            button.addEventListener('click', function(event) { switch_gallery_page(begin, end) }, false)
            
            return button
        }
        
        for(var begin = 0; begin < items.length; begin += page_len) {
            var end = begin + page_len
            var button = create_button(begin, end)
            
            buttons_panel.appendChild(button)
            buttons_panel.appendChild(document.createTextNode(' '))
        }
        
        var shortcut_buttons_panel = document.createElementNS(html_ns, 'html:div')
        
        var left_button = document.createElementNS(html_ns, 'html:input')
        
        function on_left_click() {
            var begin = sel_page_begin - page_len
            
            if(begin < 0) {
                begin = 0
            }
            
            var end = begin + page_len
            
            switch_gallery_page(begin, end)
        }
        
        left_button.type = 'button'
        left_button.value = '<< Влево'
        left_button.addEventListener('click', function(event) { on_left_click() }, false)
        
        var right_button = document.createElementNS(html_ns, 'html:input')
        
        function on_right_click() {
            var begin = sel_page_begin + page_len
            var end = begin + page_len
            
            if(items[begin]) {
                switch_gallery_page(begin, end)
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
    
    function create_gallery() {
        sel_page_begin = 0
        sel_page_elem = create_gallery_page(sel_page_begin, sel_page_begin + page_len)
        var top_menu = create_page_menu()
        var bottom_menu = create_page_menu()
        
        var panel = document.createElementNS(html_ns, 'html:div')
        panel.appendChild(top_menu)
        panel.appendChild(sel_page_elem)
        panel.appendChild(bottom_menu)
        
        return panel
    }
    
    function main() {
        var gallery_target_elem = document.getElementById('2011-01-04.MakeWebGallery:no_script')
        
        if(gallery_target_elem) {
            var gallery = create_gallery()
            
            gallery_target_elem.parentNode.replaceChild(gallery, gallery_target_elem)
        }
    }
    
    window['2011-01-04.MakeWebGallery:prepare_load'] = on_items_prepare_load
    window['2011-01-04.MakeWebGallery:load'] = on_items_load
    addEventListener('load', function(event) { main() }, false)
})()

