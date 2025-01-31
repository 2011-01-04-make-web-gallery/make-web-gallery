# This file is part of "MakeWebGallery"
# (see <https://launchpad.net/2011-01-04.make-web-gallery>).
#
# "MakeWebGallery" is free software: you can redistribute it and/or modify
# it under the terms of the GNU Lesser General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# "MakeWebGallery" is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU Lesser General Public License for more details.
#
# You should have received a copy of the GNU Lesser General Public License
# along with "MakeWebGallery".  If not, see <http://www.gnu.org/licenses/>.

import sys, os, os.path, itertools, json

from .templates import (
    AUTO_GENERATED_COMMENT,
    ITEMS_JSON_BASENAME,
    ITEMS_JSON_TYPE,
    ITEMS_JS_BASENAME,
    ITEMS_JS_IN_FILENAME,
    ITEMS_JS_IN_ELEMENT_FILENAME,
    ITEMS_JS_IN_ELEMENT_JOINER,
    STATIC_HTML_BASENAME,
    STATIC_HTML_IN_FILENAME,
    STATIC_HTML_IN_ELEMENT_FILENAME,
    STATIC_HTML_IN_PAGE_MENU_ELEMENT_FILENAME,
    STATIC_HTML_IN_ELEMENT_JOINER,
    STATIC_HTML_IN_PAGE_MENU_ELEMENT_JOINER,
    STATIC_HTML_PAGE_LEN,
)

class AppError(Exception):
    pass

def img_filter(filename):
    assert not isinstance(filename, bytes)
    
    if filename and (
                filename.endswith('.png') or
                filename.endswith('.jpg')
            ):
        return True
    else:
        return False

def gen_rich_list(img_list):
    rich_list = [
        {
            'label': img_basename.rsplit('.', 1)[0],
            'img_basename': img_basename,
        } for img_basename in img_list
    ]
    
    return rich_list

def gen_items_json_obj(rich_list):
    obj = {
        'type': ITEMS_JSON_TYPE,
        'content': rich_list,
    }
    
    return obj

def js_comment(lines):
    return '\n'.join([
        '// %s' % line for line in lines
    ])

def js_quote(value):
    return '\'%s\'' % \
        str(value).replace('\\', '\\\\').replace('\'', '\\\'')

def xml_comment(lines):
    return '<!--\n%s\n/-->' % \
        '\n'.join([
            '%s%s' % (' ' * 4, line) for line in lines
        ]).replace('--', '~~')

def xml_quote(value):
    return '\"%s\"' % \
        str(value).replace('&', '&amp;').replace('\"', '&quot;')

def xml_escape(value):
    return str(value).replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')

def js_context_add(context, key, value):
    context['unsafe_%s' % key] = value
    context['quoted_%s' % key] = js_quote(value)
    
    return context

def xml_context_add(context, key, value):
    context['unsafe_%s' % key] = value
    context['quoted_%s' % key] = xml_quote(value)
    context['escaped_%s' % key] = xml_escape(value)
    
    return context

def gen_items_js_value(rich_list):
    with open(ITEMS_JS_IN_FILENAME, 'r') as fd:
        template = fd.read()
    with open(ITEMS_JS_IN_ELEMENT_FILENAME, 'r') as fd:
        elem_template = fd.read().rstrip()
    
    elem_list = []
    
    for rich_item in rich_list:
        elem_context = {}
        js_context_add(elem_context, 'label', rich_item['label'])
        js_context_add(elem_context, 'img_basename', rich_item['img_basename'])
        
        elem_list.append(elem_template % elem_context)
    
    context = {
        'COMMENTED_AUTO_GENERATED_COMMENT': js_comment(AUTO_GENERATED_COMMENT),
        'elem_list': ITEMS_JS_IN_ELEMENT_JOINER.join(elem_list),
    }
    
    value = template % context
    
    return value

def group_by_pages(rich_list, page_len):
    rich_list_iter = iter(rich_list)
    page_counter = itertools.count()
    groups = []
    
    while True:
        page_no = next(page_counter)
        group = []
        try:
            for i in range(page_len):
                try:
                    item = next(rich_list_iter)
                except StopIteration:
                    break
                else:
                    group.append(item)
            else:
                continue
            
            break
        finally:
            groups.append([page_no, group])
    
    return groups

def gen_page_menu(grouped_rich_list):
    with open(STATIC_HTML_IN_PAGE_MENU_ELEMENT_FILENAME, 'r') as fd:
        template = fd.read().rstrip()
    
    elems = []
    
    for page_no, rich_list_page in grouped_rich_list:
        label = '%s' % page_no
        href = STATIC_HTML_BASENAME % page_no
        
        context = {}
        xml_context_add(context, 'label', label)
        xml_context_add(context, 'href', href)
        
        elems.append(template % context)
    
    menu = STATIC_HTML_IN_PAGE_MENU_ELEMENT_JOINER.join(elems)
    
    return menu

def gen_static_html_value(rich_list_page, page_no, page_menu):
    with open(STATIC_HTML_IN_FILENAME, 'r') as fd:
        template = fd.read()
    with open(STATIC_HTML_IN_ELEMENT_FILENAME, 'r') as fd:
        elem_template = fd.read().rstrip()
    
    elem_list = []
    
    for rich_item in rich_list_page:
        elem_context = {}
        xml_context_add(elem_context, 'label', rich_item['label'])
        xml_context_add(elem_context, 'img_basename', rich_item['img_basename'])
        
        elem_list.append(elem_template % elem_context)
    
    context = {
        'COMMENTED_AUTO_GENERATED_COMMENT': xml_comment(AUTO_GENERATED_COMMENT),
        'page_menu': page_menu,
        'elem_list': STATIC_HTML_IN_ELEMENT_JOINER.join(elem_list),
    }
    xml_context_add(context, 'page_no', page_no)
    
    value = template % context
    
    return value

def make_web_gallery(source_dir, target_dir):
    try:
        raw_img_list = os.listdir(source_dir)
    except OSError as e:
        raise AppError('Can not list source directory: OSError: %s' % e)
    else:
        img_list = sorted(filter(img_filter, raw_img_list))
        
        if img_list:
            if not os.path.isdir(target_dir):
                try:
                    os.makedirs(target_dir)
                except OSError as e:
                    raise AppError('Can not make target directory: OSError: %s' % e)
            
            rich_list = gen_rich_list(img_list)
            
            items_json_filename = os.path.join(target_dir, ITEMS_JSON_BASENAME)
            items_json_obj = gen_items_json_obj(rich_list)
            with open(items_json_filename, 'w') as fd:
                json.dump(items_json_obj, fd)
            
            items_js_filename = os.path.join(target_dir, ITEMS_JS_BASENAME)
            items_js_value = gen_items_js_value(rich_list)
            with open(items_js_filename, 'w') as fd:
                fd.write(items_js_value)
            
            grouped_rich_list = group_by_pages(rich_list, STATIC_HTML_PAGE_LEN)
            page_menu = gen_page_menu(grouped_rich_list)
            
            for page_no, rich_list_page in grouped_rich_list:
                static_html_filename = os.path.join(target_dir, STATIC_HTML_BASENAME % page_no)
                static_html_value = gen_static_html_value(rich_list_page, page_no, page_menu)
                with open(static_html_filename, 'w') as fd:
                    fd.write(static_html_value)
            
            return len(img_list)

