# This file is part of MakeWebGallery.
#
# MakeWebGallery is free software: you can redistribute it and/or modify
# it under the terms of the GNU Lesser General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# MakeWebGallery is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU Lesser General Public License for more details.
#
# You should have received a copy of the GNU Lesser General Public License
# along with MakeWebGallery.  If not, see <http://www.gnu.org/licenses/>.

import sys

from .make_web_gallery import (
    AppError,
    make_web_gallery,
)

class UserError(Exception):
    pass

def print_error(value):
    import os
    
    app_name = sys.argv[0]
    app_id = os.getpid()
    
    print('%s[%s]: %s' % (app_name, app_id, value), file=sys.stderr)

def run():
    try:
        for argv in sys.argv:
            assert not isinstance(argv, bytes)
        args = sys.argv[1:]
        if args:
            for arg in args:
                try:
                    source_dir = arg
                    target_dir = arg
                    
                    print('Processing %s...' % repr(source_dir))
                    try:
                        result = make_web_gallery(source_dir, target_dir)
                    except AppError as e:
                        print_error('Application Error: %s' % e)
                    else:
                        if result:
                            print('Done! (Items: %s)' % result)
                        else:
                            print('Done! (None items)')
                except Exception as e:
                    import traceback
                    
                    print_error('Unexpected Error: %s: %s' % (type(e).__name__, e))
                    traceback.print_exc()
        else:
            raise UserError('Argument\'s list is empty')
    except UserError as e:
        print(e, file=sys.stderr)

